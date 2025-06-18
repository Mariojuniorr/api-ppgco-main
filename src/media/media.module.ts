import { Module, OnModuleInit } from '@nestjs/common';
import { MediaService } from './media.service';
import { mediaProviders } from './media.providers';
import { EventManagerService } from 'src/event-manager';
import { Media } from './entities';
import { StorageModule, StorageService } from 'src/storage';
import { MediaEventListener } from './listeners';

@Module({
  imports: [StorageModule],
  providers: [MediaService, MediaEventListener, ...mediaProviders],
  exports: [MediaService],
})
export class MediaModule implements OnModuleInit {
  constructor(
    private readonly storageService: StorageService,
    private readonly eventManagerService: EventManagerService,
  ) {}

  onModuleInit() {
    Media.injectDependencies(this.storageService, this.eventManagerService);
  }
}
