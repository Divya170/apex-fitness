import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { ContactModule } from './contact/contact.module';
import { DatabaseModule } from './database/database.module';
import { GalleryModule } from './gallery/gallery.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { PlansModule } from './plans/plans.module';
import { ProgramsModule } from './programs/programs.module';
import { ScheduleModule } from './schedule/schedule.module';
import { SettingsModule } from './settings/settings.module';
import { SiteContentModule } from './site-content/site-content.module';

@Module({
  imports: [
    DatabaseModule,
    SettingsModule,
    ProgramsModule,
    PlansModule,
    ScheduleModule,
    GalleryModule,
    SiteContentModule,
    InquiriesModule,
    ContactModule,
    AdminModule,
  ],
})
export class AppModule {}
