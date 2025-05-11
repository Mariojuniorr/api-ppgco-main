import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MediaService } from 'src/media';
import { User } from './entities';
import { InjectModel } from '@nestjs/sequelize';
import { EVENTS } from './user.enum';

@Injectable()
export class AvatarFileUploadListener implements OnModuleInit {
  constructor(
    private eventEmitter: EventEmitter2,
    private mediaService: MediaService,
    private logger: Logger,
  ) {}

  onModuleInit() {
    this.eventEmitter.on(EVENTS.avatarUpload, async (user: User) => {
      if (user.avatarBuffer) {
        const url = await this.mediaService.creatFromMulterFile(
          user.avatarBuffer,
          {
            model: 'User',
            key: user.id,
            collectionName: 'avatar',
          },
        );

        this.logger.log({ url });
      }
    });
  }
}
