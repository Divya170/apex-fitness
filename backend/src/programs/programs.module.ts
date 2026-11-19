import { Controller, Get, Injectable, Module, NotFoundException, Param } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { AdminCrudController } from '../common/admin-crud.controller';
import { ACCENTS } from '../common/constants';
import { ContentService } from '../common/content.service';
import { Trim } from '../common/validation';
import { DatabaseService } from '../database/database.service';
import { BaseEntity, Repository } from '../database/repository';

export interface Program extends BaseEntity {
  slug: string;
  name: string;
  summary: string;
  details: string;
  benefits: string[];
  image: string;
  accent: string;
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}

export class CreateProgramDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Program name is required.' }) @MaxLength(80) name: string;
  @IsOptional() @Trim() @Matches(/^[a-z0-9-]*$/, { message: 'Slug may only contain lowercase letters, numbers and hyphens.' }) @MaxLength(60) slug?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(300) summary?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(4000) details?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsString({ each: true }) @MaxLength(160, { each: true }) benefits?: string[];
  @IsOptional() @Trim() @IsString() @MaxLength(300) image?: string;
  @IsOptional() @IsIn(ACCENTS) accent?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isPlaceholder?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateProgramDto extends PartialType(CreateProgramDto) {}

const ORDER = 'sort_order ASC, id ASC';

@Injectable()
export class ProgramsService extends ContentService<Program, CreateProgramDto, UpdateProgramDto> {
  protected readonly label = 'Program';
  protected readonly repo: Repository<Program>;
  protected searchColumns = ['name', 'summary'];
  protected slugSource = 'name';
  protected adminOrder = ORDER;

  constructor(db: DatabaseService) {
    super();
    this.repo = new Repository<Program>(db, 'programs', {
      slug: 'text', name: 'text', summary: 'text', details: 'text', benefits: 'json', image: 'text',
      accent: 'text', sortOrder: 'int', isPlaceholder: 'bool', published: 'bool',
    });
  }

  list(): Program[] {
    return this.repo.find({ where: ['published = 1'], orderBy: ORDER });
  }

  bySlug(slug: string): Program {
    const p = this.repo.findOne(['slug = ?', 'published = 1'], [slug]);
    if (!p) throw new NotFoundException('Program not found.');
    return p;
  }

  findPublished(id: number): Program | undefined {
    return this.repo.findOne(['id = ?', 'published = 1'], [id]);
  }

  findPublishedBySlug(slug: string): Program | undefined {
    return this.repo.findOne(['slug = ?', 'published = 1'], [slug]);
  }
}

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programs: ProgramsService) {}
  @Get() list() { return this.programs.list(); }
  @Get(':slug') bySlug(@Param('slug') slug: string) { return this.programs.bySlug(slug); }
}

const AdminProgramsController = AdminCrudController('programs', ProgramsService, CreateProgramDto, UpdateProgramDto);

@Module({
  controllers: [ProgramsController, AdminProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService],
})
export class ProgramsModule {}
