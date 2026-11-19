import { BadRequestException, Controller, Get, Injectable, Module, NotFoundException, Query } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { AdminCrudController } from '../common/admin-crud.controller';
import { DAYS, TIME_RE } from '../common/constants';
import { AdminCrudService } from '../common/content.service';
import { Trim } from '../common/validation';
import { DatabaseService, SqlParam } from '../database/database.service';
import { BaseEntity, likeParam, Repository } from '../database/repository';
import { ProgramsModule, ProgramsService } from '../programs/programs.module';

export interface Session extends BaseEntity {
  day: number;
  startTime: string;
  endTime: string;
  title: string;
  programId: number | null;
  level: string;
  coach: string;
  info: string;
  published: boolean;
}

export interface PublicSession extends Session {
  dayName: string;
  programName: string;
  programSlug: string;
}

export class CreateSessionDto {
  @IsInt({ message: 'Choose a day.' }) @Min(0) @Max(6) day: number;
  @Matches(TIME_RE, { message: 'Use 24-hour time, e.g. 06:30.' }) startTime: string;
  @IsOptional() @ValidateIf((_, v) => v !== '') @Matches(TIME_RE, { message: 'Use 24-hour time, e.g. 07:30.' }) endTime?: string;
  @Trim() @IsString() @IsNotEmpty({ message: 'Session title is required.' }) @MaxLength(100) title: string;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() programId?: number | null;
  @IsOptional() @Trim() @IsString() @MaxLength(60) level?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(80) coach?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(300) info?: string;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateSessionDto extends PartialType(CreateSessionDto) {}

export class ScheduleQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(6) day?: number;
  @IsOptional() @IsString() @MaxLength(60) program?: string; // program slug
}

const SELECT = `SELECT s.*, p.name AS program_name, p.slug AS program_slug
  FROM sessions s LEFT JOIN programs p ON p.id = s.program_id`;

@Injectable()
export class ScheduleService implements AdminCrudService<CreateSessionDto, UpdateSessionDto> {
  readonly repo: Repository<Session>;

  constructor(private readonly db: DatabaseService, private readonly programs: ProgramsService) {
    this.repo = new Repository<Session>(db, 'sessions', {
      day: 'int', startTime: 'text', endTime: 'text', title: 'text', programId: 'int',
      level: 'text', coach: 'text', info: 'text', published: 'bool',
    });
  }

  private toPublic(row: Record<string, unknown>): PublicSession {
    const s = this.repo.map(row);
    return { ...s, dayName: DAYS[s.day], programName: (row.program_name as string) ?? '', programSlug: (row.program_slug as string) ?? '' };
  }

  /** Published sessions, filtered by day and/or program slug, in time order. */
  list(q: ScheduleQueryDto): PublicSession[] {
    const where = ['s.published = 1'];
    const params: SqlParam[] = [];
    if (q.day !== undefined) { where.push('s.day = ?'); params.push(q.day); }
    if (q.program) { where.push('p.slug = ?'); params.push(q.program); }
    return this.db.all(`${SELECT} WHERE ${where.join(' AND ')} ORDER BY s.day, s.start_time`, params).map((r) => this.toPublic(r));
  }

  /** Session counts per day (all 7 days, zeros included) for the day selector. */
  summary() {
    const rows = this.db.all<{ day: number; n: number }>('SELECT day, COUNT(*) AS n FROM sessions WHERE published = 1 GROUP BY day');
    const counts = new Map(rows.map((r) => [r.day, r.n]));
    const days = DAYS.map((name, day) => ({ day, name, count: counts.get(day) ?? 0 }));
    return { total: days.reduce((n, d) => n + d.count, 0), days };
  }

  private check(merged: Partial<Session>) {
    const errors: Record<string, string> = {};
    if (merged.endTime && merged.startTime && merged.endTime <= merged.startTime) errors.endTime = 'End time must be after the start time.';
    if (merged.programId != null && !this.programs.findPublished(merged.programId)) errors.programId = 'Choose a published program.';
    if (Object.keys(errors).length) throw new BadRequestException({ statusCode: 400, message: 'Please check the session details.', errors });
  }

  adminList(q?: string) {
    const term = q?.trim();
    const where = term ? `WHERE s.title LIKE ? ESCAPE '\\' OR s.coach LIKE ? ESCAPE '\\' OR p.name LIKE ? ESCAPE '\\'` : '';
    const params = term ? [likeParam(term), likeParam(term), likeParam(term)] : [];
    return this.db.all(`${SELECT} ${where} ORDER BY s.day, s.start_time`, params).map((r) => this.toPublic(r));
  }

  adminGet(id: number) {
    const row = this.db.get(`${SELECT} WHERE s.id = ?`, [id]);
    if (!row) throw new NotFoundException('Session not found.');
    return this.toPublic(row);
  }

  create(dto: CreateSessionDto) {
    this.check(dto);
    const s = this.repo.insert({ ...dto });
    return this.adminGet(s.id);
  }

  update(id: number, dto: UpdateSessionDto) {
    const existing = this.adminGet(id);
    this.check({ ...existing, ...dto });
    this.repo.update(id, { ...dto });
    return this.adminGet(id);
  }

  remove(id: number) {
    this.adminGet(id);
    this.repo.delete(id);
  }
}

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly schedule: ScheduleService) {}
  @Get() list(@Query() q: ScheduleQueryDto) { return this.schedule.list(q); }
  @Get('summary') summary() { return this.schedule.summary(); }
}

const AdminScheduleController = AdminCrudController('sessions', ScheduleService, CreateSessionDto, UpdateSessionDto);

@Module({
  imports: [ProgramsModule],
  controllers: [ScheduleController, AdminScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
