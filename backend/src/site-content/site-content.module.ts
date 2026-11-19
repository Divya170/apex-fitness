import { BadRequestException, Controller, Get, Injectable, Module } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, ValidateIf } from 'class-validator';
import { AdminCrudController } from '../common/admin-crud.controller';
import { BENEFIT_ICONS } from '../common/constants';
import { ContentService } from '../common/content.service';
import { Trim } from '../common/validation';
import { DatabaseService } from '../database/database.service';
import { BaseEntity, Repository } from '../database/repository';

const ORDER = 'sort_order ASC, id ASC';
const flags = { sortOrder: 'int', isPlaceholder: 'bool', published: 'bool' } as const;

/* ───── Membership benefits ───── */
export interface Benefit extends BaseEntity { title: string; detail: string; icon: string; sortOrder: number; isPlaceholder: boolean; published: boolean }
export class CreateBenefitDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Benefit title is required.' }) @MaxLength(100) title: string;
  @IsOptional() @Trim() @IsString() @MaxLength(300) detail?: string;
  @IsOptional() @IsIn(BENEFIT_ICONS) icon?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isPlaceholder?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateBenefitDto extends PartialType(CreateBenefitDto) {}

@Injectable()
export class BenefitsService extends ContentService<Benefit, CreateBenefitDto, UpdateBenefitDto> {
  protected readonly label = 'Benefit';
  protected readonly repo: Repository<Benefit>;
  protected searchColumns = ['title', 'detail'];
  protected adminOrder = ORDER;
  constructor(db: DatabaseService) {
    super();
    this.repo = new Repository<Benefit>(db, 'benefits', { title: 'text', detail: 'text', icon: 'text', ...flags });
  }
  list() { return this.repo.find({ where: ['published = 1'], orderBy: ORDER }); }
}

/* ───── Facilities ───── */
export interface Facility extends BaseEntity { name: string; description: string; image: string; sortOrder: number; isPlaceholder: boolean; published: boolean }
export class CreateFacilityDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Facility name is required.' }) @MaxLength(100) name: string;
  @IsOptional() @Trim() @IsString() @MaxLength(400) description?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(400) image?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isPlaceholder?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateFacilityDto extends PartialType(CreateFacilityDto) {}

@Injectable()
export class FacilitiesService extends ContentService<Facility, CreateFacilityDto, UpdateFacilityDto> {
  protected readonly label = 'Facility';
  protected readonly repo: Repository<Facility>;
  protected searchColumns = ['name', 'description'];
  protected adminOrder = ORDER;
  constructor(db: DatabaseService) {
    super();
    this.repo = new Repository<Facility>(db, 'facilities', { name: 'text', description: 'text', image: 'text', ...flags });
  }
  list() { return this.repo.find({ where: ['published = 1'], orderBy: ORDER }); }
}

/* ───── Business hours ───── */
export interface HoursRow extends BaseEntity { label: string; value: string | null; sortOrder: number }
export class CreateHoursDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Day label is required.' }) @MaxLength(60) label: string;
  @IsOptional() @ValidateIf((_, v) => v !== null) @Trim() @IsString() @MaxLength(80) value?: string | null;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
export class UpdateHoursDto extends PartialType(CreateHoursDto) {}

@Injectable()
export class HoursService extends ContentService<HoursRow, CreateHoursDto, UpdateHoursDto> {
  protected readonly label = 'Hours row';
  protected readonly repo: Repository<HoursRow>;
  protected searchColumns = ['label', 'value'];
  protected adminOrder = ORDER;
  constructor(db: DatabaseService) {
    super();
    this.repo = new Repository<HoursRow>(db, 'hours', { label: 'text', value: 'text', sortOrder: 'int' });
  }
  /** Empty strings are stored as NULL = "not supplied". */
  create(dto: CreateHoursDto) { return super.create({ ...dto, value: dto.value || null }); }
  update(id: number, dto: UpdateHoursDto) { return super.update(id, dto.value === '' ? { ...dto, value: null } : dto); }
  list() {
    const rows = this.repo.find({ orderBy: ORDER });
    return { confirmed: rows.length > 0 && rows.every((r) => !!r.value), rows };
  }
}

/* ───── Trainers (verified only) ───── */
export interface Trainer extends BaseEntity { name: string; role: string; bio: string; qualifications: string; photo: string; sortOrder: number; published: boolean }
export class CreateTrainerDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Name is required.' }) @MaxLength(100) name: string;
  @IsOptional() @Trim() @IsString() @MaxLength(100) role?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(1500) bio?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(400) qualifications?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(400) photo?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateTrainerDto extends PartialType(CreateTrainerDto) {}

@Injectable()
export class TrainersService extends ContentService<Trainer, CreateTrainerDto, UpdateTrainerDto> {
  protected readonly label = 'Trainer';
  protected readonly repo: Repository<Trainer>;
  protected searchColumns = ['name', 'role'];
  protected adminOrder = ORDER;
  constructor(db: DatabaseService) {
    super();
    this.repo = new Repository<Trainer>(db, 'trainers', { name: 'text', role: 'text', bio: 'text', qualifications: 'text', photo: 'text', sortOrder: 'int', published: 'bool' });
  }
  list() { return this.repo.find({ where: ['published = 1'], orderBy: ORDER }); }
}

/* ───── Testimonials (consent required) ───── */
export interface Testimonial extends BaseEntity { quote: string; attribution: string; consentConfirmed: boolean; sortOrder: number; published: boolean }
export class CreateTestimonialDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Quote is required.' }) @MaxLength(1000) quote: string;
  @Trim() @IsString() @IsNotEmpty({ message: 'Attribution is required.' }) @MaxLength(120) attribution: string;
  @IsOptional() @IsBoolean() consentConfirmed?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}

@Injectable()
export class TestimonialsService extends ContentService<Testimonial, CreateTestimonialDto, UpdateTestimonialDto> {
  protected readonly label = 'Testimonial';
  protected readonly repo: Repository<Testimonial>;
  protected searchColumns = ['quote', 'attribution'];
  protected adminOrder = ORDER;
  constructor(db: DatabaseService) {
    super();
    this.repo = new Repository<Testimonial>(db, 'testimonials', { quote: 'text', attribution: 'text', consentConfirmed: 'bool', sortOrder: 'int', published: 'bool' });
  }
  protected beforeSave(merged: Record<string, unknown>) {
    if (merged.published && !merged.consentConfirmed) {
      throw new BadRequestException({ statusCode: 400, message: 'A testimonial can only be published with the member’s permission.', errors: { consentConfirmed: 'Confirm permission before publishing.' } });
    }
  }
  list() {
    return this.repo.find({ where: ['published = 1', 'consent_confirmed = 1'], orderBy: ORDER }).map(({ id, quote, attribution }) => ({ id, quote, attribution }));
  }
}

@Controller()
export class SiteContentController {
  constructor(
    private readonly benefits: BenefitsService,
    private readonly facilities: FacilitiesService,
    private readonly hours: HoursService,
    private readonly trainers: TrainersService,
    private readonly testimonials: TestimonialsService,
  ) {}
  @Get('benefits') listBenefits() { return this.benefits.list(); }
  @Get('facilities') listFacilities() { return this.facilities.list(); }
  @Get('hours') listHours() { return this.hours.list(); }
  @Get('trainers') listTrainers() { return this.trainers.list(); }
  @Get('testimonials') listTestimonials() { return this.testimonials.list(); }
}

@Module({
  controllers: [
    SiteContentController,
    AdminCrudController('benefits', BenefitsService, CreateBenefitDto, UpdateBenefitDto),
    AdminCrudController('facilities', FacilitiesService, CreateFacilityDto, UpdateFacilityDto),
    AdminCrudController('hours', HoursService, CreateHoursDto, UpdateHoursDto),
    AdminCrudController('trainers', TrainersService, CreateTrainerDto, UpdateTrainerDto),
    AdminCrudController('testimonials', TestimonialsService, CreateTestimonialDto, UpdateTestimonialDto),
  ],
  providers: [BenefitsService, FacilitiesService, HoursService, TrainersService, TestimonialsService],
})
export class SiteContentModule {}
