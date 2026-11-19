import {
  Body, ConflictException, Controller, Delete, Get, HttpCode, Injectable, Logger, Module, Param, ParseIntPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { Equals, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AdminGuard } from '../common/admin.guard';
import { CONTACT_TOPICS, DUPLICATE_WINDOW_MS, MESSAGE_STATUSES, SUBMISSION_LIMIT, SUBMISSION_WINDOW_MS } from '../common/constants';
import { ClientIp, hashIp, makeReference, RateLimiter } from '../common/security';
import { AdminListQuery, phoneError, SubmissionStore } from '../common/submissions';
import { Trim, validationException } from '../common/validation';
import { DatabaseService } from '../database/database.service';
import { BaseEntity, Repository } from '../database/repository';

export interface ContactMessage extends BaseEntity {
  reference: string; name: string; email: string; phone: string; topic: string; message: string;
  consent: boolean; status: string; notes: string; ipHash: string;
}

export class CreateContactDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Enter your full name.' }) @MaxLength(120) name: string;
  @Trim() @IsEmail({}, { message: 'Enter a valid email, like name@example.com.' }) @MaxLength(160) email: string;
  @IsOptional() @Trim() @IsString() @MaxLength(30) phone?: string;
  @IsIn(CONTACT_TOPICS, { message: 'Choose an inquiry type.' }) topic: string;
  @Trim() @IsString() @MinLength(10, { message: 'Write a message of at least 10 characters.' }) @MaxLength(1500, { message: 'Keep your message under 1,500 characters.' }) message: string;
  @Equals(true, { message: 'Please agree to be contacted so the club can reply.' }) consent: boolean;
  @IsOptional() @IsString() @MaxLength(200) website?: string;
}

export class UpdateMessageDto {
  @IsOptional() @IsIn(MESSAGE_STATUSES, { message: 'Unknown status.' }) status?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(4000) notes?: string;
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger('ContactMessages');
  readonly store: SubmissionStore<ContactMessage>;

  constructor(private readonly db: DatabaseService, private readonly limiter: RateLimiter) {
    const repo = new Repository<ContactMessage>(db, 'contact_messages', {
      reference: 'text', name: 'text', email: 'text', phone: 'text', topic: 'text', message: 'text',
      consent: 'bool', status: 'text', notes: 'text', ipHash: 'text',
    });
    this.store = new SubmissionStore(db, repo, ['reference', 'name', 'email', 'message'], MESSAGE_STATUSES, 'Message');
  }

  submit(dto: CreateContactDto, ip: string) {
    const now = new Date();
    if (dto.website?.trim()) {
      this.logger.warn('Honeypot triggered — message discarded.');
      return { reference: makeReference('AM', now), submittedAt: now.toISOString(), topic: dto.topic };
    }
    const ipHash = hashIp(ip);
    this.limiter.consume(`msg:${ipHash}`, SUBMISSION_LIMIT, SUBMISSION_WINDOW_MS);
    const pErr = phoneError(dto.phone);
    if (pErr) throw validationException({ phone: pErr });

    const since = new Date(now.getTime() - DUPLICATE_WINDOW_MS).toISOString();
    const dupe = this.db.get<{ reference: string }>(
      'SELECT reference FROM contact_messages WHERE lower(email) = lower(?) AND message = ? AND created_at >= ? LIMIT 1',
      [dto.email, dto.message, since],
    );
    if (dupe) throw new ConflictException({ statusCode: 409, message: 'We already received this message — the team will reply soon.', reference: dupe.reference });

    const repo = this.store.repo;
    let reference = makeReference('AM', now);
    while (repo.findOne(['reference = ?'], [reference])) reference = makeReference('AM', now);
    const saved = repo.insert({ reference, name: dto.name, email: dto.email.toLowerCase(), phone: dto.phone ?? '', topic: dto.topic, message: dto.message, consent: true, status: 'new', ipHash });
    this.logger.log(`New contact message ${saved.reference} (${saved.topic})`);
    return { reference: saved.reference, submittedAt: saved.createdAt, topic: saved.topic };
  }
}

@Controller()
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post('contact') @HttpCode(201)
  submit(@Body() dto: CreateContactDto, @ClientIp() ip: string) { return this.contact.submit(dto, ip); }

  @Get('admin/messages') @UseGuards(AdminGuard)
  list(@Query() q: AdminListQuery) { return this.contact.store.list(q); }

  @Get('admin/messages/:id') @UseGuards(AdminGuard)
  get(@Param('id', ParseIntPipe) id: number) { return this.contact.store.get(id); }

  @Patch('admin/messages/:id') @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMessageDto) { return this.contact.store.update(id, dto); }

  @Delete('admin/messages/:id') @UseGuards(AdminGuard) @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) { this.contact.store.remove(id); }
}

@Module({
  controllers: [ContactController],
  providers: [ContactService, RateLimiter],
  exports: [ContactService],
})
export class ContactModule {}
