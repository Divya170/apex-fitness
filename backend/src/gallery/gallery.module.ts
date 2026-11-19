import { Controller, Get, Injectable, Module, Query } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { AdminCrudController } from '../common/admin-crud.controller';
import { GALLERY_CATEGORIES } from '../common/constants';
import { ContentService } from '../common/content.service';
import { Trim } from '../common/validation';
import { DatabaseService, SqlParam } from '../database/database.service';
import { BaseEntity, Repository } from '../database/repository';

export interface GalleryImage extends BaseEntity {
  title: string;
  category: string;
  image: string;
  alt: string;
  ratio: string;
  featured: boolean;
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}

export class CreateGalleryImageDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Title is required.' }) @MaxLength(100) title: string;
  @IsIn(GALLERY_CATEGORIES, { message: 'Choose a gallery category.' }) category: string;
  @Trim() @IsString() @IsNotEmpty({ message: 'Image path or URL is required.' }) @MaxLength(400) image: string;
  @Trim() @IsString() @IsNotEmpty({ message: 'Describe the image for screen-reader users.' }) @MaxLength(200) alt: string;
  @IsOptional() @Matches(/^\d{1,2} \/ \d{1,2}$/, { message: 'Use a ratio like "4 / 3".' }) ratio?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isPlaceholder?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateGalleryImageDto extends PartialType(CreateGalleryImageDto) {}

export class GalleryQueryDto {
  @IsOptional() @IsIn(GALLERY_CATEGORIES) category?: string;
}

const ORDER = 'sort_order ASC, id ASC';

@Injectable()
export class GalleryService extends ContentService<GalleryImage, CreateGalleryImageDto, UpdateGalleryImageDto> {
  protected readonly label = 'Image';
  protected readonly repo: Repository<GalleryImage>;
  protected searchColumns = ['title', 'category', 'alt'];
  protected adminOrder = ORDER;

  constructor(private readonly db: DatabaseService) {
    super();
    this.repo = new Repository<GalleryImage>(db, 'gallery_images', {
      title: 'text', category: 'text', image: 'text', alt: 'text', ratio: 'text', featured: 'bool',
      sortOrder: 'int', isPlaceholder: 'bool', published: 'bool',
    });
  }

  list(q: GalleryQueryDto): GalleryImage[] {
    const where = ['published = 1'];
    const params: SqlParam[] = [];
    if (q.category) { where.push('category = ?'); params.push(q.category); }
    return this.repo.find({ where, params, orderBy: ORDER });
  }

  /** Featured images for the slow crossfade; falls back to the first three. */
  featured(): GalleryImage[] {
    const f = this.repo.find({ where: ['published = 1', 'featured = 1'], orderBy: ORDER, limit: 5 });
    return f.length ? f : this.repo.find({ where: ['published = 1'], orderBy: ORDER, limit: 3 });
  }

  /** All categories in a fixed order with counts — only categories with images are filterable in the UI. */
  categories() {
    const rows = this.db.all<{ value: string; count: number }>('SELECT category AS value, COUNT(*) AS count FROM gallery_images WHERE published = 1 GROUP BY category');
    const m = new Map(rows.map((r) => [r.value, r.count]));
    return GALLERY_CATEGORIES.map((value) => ({ value, count: m.get(value) ?? 0 }));
  }
}

@Controller('gallery')
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}
  @Get() list(@Query() q: GalleryQueryDto) { return this.gallery.list(q); }
  @Get('featured') featured() { return this.gallery.featured(); }
  @Get('categories') categories() { return this.gallery.categories(); }
}

const AdminGalleryController = AdminCrudController('gallery', GalleryService, CreateGalleryImageDto, UpdateGalleryImageDto);

@Module({
  controllers: [GalleryController, AdminGalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
