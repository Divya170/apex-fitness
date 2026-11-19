import {
  Body, ConflictException, Controller, Delete, Get, HttpCode, Injectable, Logger, Module, Param, ParseIntPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { Equals, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { AdminGuard } from '../common/admin.guard';
import { DUPLICATE_WINDOW_MS, INQUIRY_STATUSES, SUBMISSION_LIMIT, SUBMISSION_WINDOW_MS } from '../common/constants';
import { ClientIp, hashIp, makeReference, RateLimiter } from '../common/security';
import { AdminListQuery, phoneError, SubmissionStore } from '../common/submissions';
import { Trim, validationException } from '../common/validation';
import { DatabaseService } from '../database/database.service';
import { BaseEntity, Repository } from '../database/repository';
import { PlansModule, PlansService } from '../plans/plans.module';
import { ProgramsModule, ProgramsService } from '../programs/programs.module';

export interface MembershipInquiry extends BaseEntity {
  reference: string; name: string; email: string; phone: string;
  planId: number | null; planName: string; programId: number | null; programName: string;
  message: string; consent: boolean; status: string; notes: string; ipHash: string;
}

export class CreateInquiryDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Enter your full name.' }) @MaxLength(120) name: string;
  @Trim() @IsEmail({}, { message: 'Enter a valid email, like name@example.com.' }) @MaxLength(160) email: string;
  @IsOptional() @Trim() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt({ message: 'Choose a plan from the list.' }) planId?: number | null;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt({ message: 'Choose a program from the list.' }) programId?: number | null;
  @IsOptional() @Trim() @IsString() @MaxLength(1000, { message: 'Keep your message under 1,000 characters.' }) message?: string;
  @Equals(true, { message: 'Please agree to be contacted so the club can reply.' }) consent: boolean;
  /** Honeypot. */
  @IsOptional() @IsString() @MaxLength(200) website?: string;
}

export class UpdateInquiryDto {
  @IsOptional() @IsIn(INQUIRY_STATUSES, { message: 'Unknown status.' }) status?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(4000) notes?: string;
}

export interface InquiryReceipt { reference: string; submittedAt: string; planName: string; programName: string }

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger('MembershipInquiries');
  readonly store: SubmissionStore<MembershipInquiry>;

  constructor(
    private readonly db: DatabaseService,
    private readonly plans: PlansService,
    private readonly programs: ProgramsService,
    private readonly limiter: RateLimiter,
  ) {
    const repo = new Repository<MembershipInquiry>(db, 'membership_inquiries', {
      reference: 'text', name: 'text', email: 'text', phone: 'text', planId: 'int', planName: 'text',
      programId: 'int', programName: 'text', message: 'text', consent: 'bool', status: 'text', notes: 'text', ipHash: 'text',
    });
    this.store = new SubmissionStore(db, repo, ['reference', 'name', 'email', 'plan_name', 'program_name'], INQUIRY_STATUSES, 'Inquiry');
  }

  submit(dto: CreateInquiryDto, ip: string): InquiryReceipt {
    const now = new Date();
    if (dto.website?.trim()) {
      this.logger.warn('Honeypot triggered — inquiry discarded.');
      return { reference: makeReference('AF', now), submittedAt: now.toISOString(), planName: '', programName: '' };
    }
    const ipHash = hashIp(ip);
    this.limiter.consume(`inq:${ipHash}`, SUBMISSION_LIMIT, SUBMISSION_WINDOW_MS);

    const errors: Record<string, string> = {};
    const pErr = phoneError(dto.phone);
    if (pErr) errors.phone = pErr;
    let planName = '';
    let programName = '';
    if (dto.planId != null) {
      const plan = this.plans.findPublished(dto.planId);
      if (!plan) errors.planId = 'That plan is no longer available — choose another or "Not sure yet".';
      else planName = plan.name;
    }
    if (dto.programId != null) {
      const program = this.programs.findPublished(dto.programId);
      if (!program) errors.programId = 'That program is no longer available — choose another or "Not sure yet".';
      else programName = program.name;
    }
    if (Object.keys(errors).length) throw validationException(errors);

    const since = new Date(now.getTime() - DUPLICATE_WINDOW_MS).toISOString();
    const dupe = this.db.get<{ reference: string }>(
      'SELECT reference FROM membership_inquiries WHERE lower(email) = lower(?) AND created_at >= ? ORDER BY id DESC LIMIT 1',
      [dto.email, since],
    );
    if (dupe) {
      throw new ConflictException({ statusCode: 409, message: 'We already received a membership inquiry from this email a few minutes ago — no need to send it again.', reference: dupe.reference });
    }

    const repo = this.store.repo;
    let reference = makeReference('AF', now);
    while (repo.findOne(['reference = ?'], [reference])) reference = makeReference('AF', now);
    const saved = repo.insert({
      reference, name: dto.name, email: dto.email.toLowerCase(), phone: dto.phone ?? '',
      planId: dto.planId ?? null, planName, programId: dto.programId ?? null, programName,
      message: dto.message ?? '', consent: true, status: 'new', ipHash,
    });
    // Integration point: notify the club / confirm to the visitor by email here.
    this.logger.log(`New membership inquiry ${saved.reference}`);
    return { reference: saved.reference, submittedAt: saved.createdAt, planName, programName };
  }
}

@Controller()
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Post('membership-inquiries') @HttpCode(201)
  submit(@Body() dto: CreateInquiryDto, @ClientIp() ip: string) { return this.inquiries.submit(dto, ip); }

  @Get('admin/inquiries') @UseGuards(AdminGuard)
  list(@Query() q: AdminListQuery) { return this.inquiries.store.list(q); }

  @Get('admin/inquiries/:id') @UseGuards(AdminGuard)
  get(@Param('id', ParseIntPipe) id: number) { return this.inquiries.store.get(id); }

  @Patch('admin/inquiries/:id') @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInquiryDto) { return this.inquiries.store.update(id, dto); }

  @Delete('admin/inquiries/:id') @UseGuards(AdminGuard) @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) { this.inquiries.store.remove(id); }
}

@Module({
  imports: [PlansModule, ProgramsModule],
  controllers: [InquiriesController],
  providers: [InquiriesService, RateLimiter],
  exports: [InquiriesService],
})
export class InquiriesModule {}
