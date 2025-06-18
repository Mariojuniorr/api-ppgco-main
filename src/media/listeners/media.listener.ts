import { OnEvent } from '@nestjs/event-emitter';
import { Events } from '../media.enum';
import { OnMediaUploadEvent } from '../events';
import { StorageService } from 'src/storage';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaEventListener {
  public constructor(private readonly storageService: StorageService) {}

  @OnEvent(Events.UPLOAD_MEDIA)
  async onMediaUpload(event: OnMediaUploadEvent) {
    const media = event.media.dataValues;
    console.log({ media: event.media });
    return this.storageService
      .saveFile(media.mediaBuffer, media.filename, media.collectionName)
      .then(() =>
        console.log(`Arquivos salvos com sucesso: ${event.media.getUrl()}`),
      );
  }
}
