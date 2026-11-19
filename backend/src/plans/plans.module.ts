import { BadRequestException, Controller, Get, Injectable, Module } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { AdminCrudController } from '../common/admin-crud.controller';
import { ContentService } from '../common/content.service';
import { Trim } from '../common/validation';
import { DatabaseService } from '../database/database.service';
import { BaseEntity, Repository } from '../database/repository';

export interface Plan extends BaseEntity {
  slug: string;
  name: string;
  priceCents: number | null;
  billing: string;
  facilities: string[];
  services: string[];
  benefits: string[];
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}

/** Plan as shown publicly: price formatted, or null when the club hasn't supplied pricing. */
export interface PublicPlan extends Plan {
  priceLabel: string | null;
}

const list = () => [IsOptional(), IsArray(), ArrayMaxSize(12), IsString({ each: true }), MaxLength(160, { each: true })];
function ListField(): PropertyDecorator {
  return (target, key) => list().forEach((d) => d(target, key));
}

export class CreatePlanDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Plan name is required.' }) @MaxLength(80) name: string;
  @IsOptional() @Trim() @Matches(/^[a-z0-9-]*$/, { message: 'Slug may only contain lowercase letters, numbers and hyphens.' }) @MaxLength(60) slug?: string;
  /** Price in cents; null = not supplied yet. */
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt({ message: 'Price must be a whole number of cents.' }) @Min(0) @Max(10_000_000) priceCents?: number | null;
  @IsOptional() @Trim() @IsString() @MaxLength(60) billing?: string;
  @ListField() facilities?: string[];
  @ListField() services?: string[];
  @ListField() benefits?: string[];
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isPlaceholder?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdatePlanDto extends PartialType(CreatePlanDto) {}

const ORDER = 'sort_order ASC, id ASC';
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 });

@Injectable()
export class PlansService extends ContentService<Plan, CreatePlanDto, UpdatePlanDto> {
  protected readonly label = 'Plan';
  protected readonly repo: Repository<Plan>;
  protected searchColumns = ['name', 'billing'];
  protected slugSource = 'name';
  protected adminOrder = ORDER;

  constructor(db: DatabaseService) {
    super();
    this.repo = new Repository<Plan>(db, 'plans', {
      slug: 'text', name: 'text', priceCents: 'int', billing: 'text', facilities: 'json', services: 'json',
      benefits: 'json', sortOrder: 'int', isPlaceholder: 'bool', published: 'bool',
    });
  }

  /** A priced plan must say how often it is billed. */
  protected beforeSave(merged: Record<string, unknown>) {
    const billing = String(merged.billing ?? '').trim();
    if (merged.priceCents != null && (!billing || /^\[.*\]$/.test(billing))) {
      throw new BadRequestException({ statusCode: 400, message: 'Add a billing frequency for a priced plan.', errors: { billing: 'Required when a price is set (e.g. "per month").' } });
    }
  }

  toPublic(p: Plan): PublicPlan {
    return { ...p, priceLabel: p.priceCents == null ? null : usd.format(p.priceCents / 100) };
  }

  list(): PublicPlan[] {
    return this.repo.find({ where: ['published = 1'], orderBy: ORDER }).map((p) => this.toPublic(p));
  }

  findPublished(id: number): Plan | undefined {
    return this.repo.findOne(['id = ?', 'published = 1'], [id]);
  }
}

@Controller('plans')
export class PlansController {
  constructor(private readonly plans: PlansService) {}
  @Get() list() { return this.plans.list(); }
}

const AdminPlansController = AdminCrudController('plans', PlansService, CreatePlanDto, UpdatePlanDto);

@Module({
  controllers: [PlansController, AdminPlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
