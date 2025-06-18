import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StorageDisk, StorageService } from 'src/storage';
import { CoverUploadEvent } from '../events';
import { Events } from '../system-apliances.enum';
import { MediaService } from 'src/media';

@Injectable()
export class CoverListener {
  public constructor(private readonly mediaService: MediaService) {}

  @OnEvent(Events.COVER_UPLOAD)
  async onCoverUpload(event: CoverUploadEvent) {
    console.log({ event });
    await this.mediaService.insertMediaIn(event.systemApliance, {
      file: event.coverBuffer,
      disk: StorageDisk.LOCAL, // TODO - make it dynamic
    });
  }
}
