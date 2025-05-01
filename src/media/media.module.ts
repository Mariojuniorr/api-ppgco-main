import { Module } from '@nestjs/common';
import { MediaService } from './services/media.service';
import { mediaProviders } from './media.providers';
import { StorageModule } from 'src/storage';

@Module({
  imports: [StorageModule],
  providers: [MediaService, ...mediaProviders],
  exports: [MediaService],
})
export class MediaModule {}
