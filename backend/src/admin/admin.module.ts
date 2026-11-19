import { Controller, Get, HttpCode, Module, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { CONTACT_TOPICS, DAYS, GALLERY_CATEGORIES, INQUIRY_STATUSES, MESSAGE_STATUSES } from '../common/constants';
import { ContactModule, ContactService } from '../contact/contact.module';
import { DatabaseService } from '../database/database.service';
import { InquiriesModule, InquiriesService } from '../inquiries/inquiries.module';

@Controller()
export class AdminController {
  constructor(
    private readonly db: DatabaseService,
    private readonly inquiries: InquiriesService,
    private readonly contact: ContactService,
  ) {}

  @Post('auth/verify') @HttpCode(200) @UseGuards(AdminGuard)
  verify() { return { ok: true }; }

  @Get('admin/stats') @UseGuards(AdminGuard)
  stats() {
    const n = (sql: string) => this.db.get<{ n: number }>(sql)?.n ?? 0;
    return {
      inquiries: this.inquiries.store.countByStatus('membership_inquiries'),
      messages: this.contact.store.countByStatus('contact_messages'),
      programs: n('SELECT COUNT(*) AS n FROM programs WHERE published = 1'),
      plansPriced: n('SELECT COUNT(*) AS n FROM plans WHERE published = 1 AND price_cents IS NOT NULL'),
      sessions: n('SELECT COUNT(*) AS n FROM sessions WHERE published = 1'),
      gallery: n('SELECT COUNT(*) AS n FROM gallery_images WHERE published = 1'),
      hoursMissing: n('SELECT COUNT(*) AS n FROM hours WHERE value IS NULL'),
      placeholders:
        n('SELECT COUNT(*) AS n FROM programs WHERE is_placeholder = 1') +
        n('SELECT COUNT(*) AS n FROM plans WHERE is_placeholder = 1') +
        n('SELECT COUNT(*) AS n FROM benefits WHERE is_placeholder = 1') +
        n('SELECT COUNT(*) AS n FROM facilities WHERE is_placeholder = 1') +
        n('SELECT COUNT(*) AS n FROM gallery_images WHERE is_placeholder = 1'),
    };
  }

  @Get('meta')
  meta() {
    return { days: DAYS, galleryCategories: GALLERY_CATEGORIES, contactTopics: CONTACT_TOPICS, inquiryStatuses: INQUIRY_STATUSES, messageStatuses: MESSAGE_STATUSES };
  }

  @Get('health')
  health() { return { ok: true, time: new Date().toISOString() }; }
}

@Module({
  imports: [InquiriesModule, ContactModule],
  controllers: [AdminController],
})
export class AdminModule {}
