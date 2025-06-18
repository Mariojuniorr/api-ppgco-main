import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StorageDisk } from 'src/storage';
import { MediaService } from 'src/media';
import { AvatarUploadEvent, FileUploadEvent } from '../events';
import { Events } from '../user.enum';

@Injectable()
export class FileListener {
  public constructor(private readonly mediaService: MediaService) {}

  @OnEvent(Events.FILE_UPLOAD)
  async onFileUpload(event: FileUploadEvent) {
    await Promise.all(
      Object.values(event.files).map((files) =>
        Promise.all(
          files.map((file) =>
            this.mediaService.insertMediaIn(event.user, {
              file,
              disk: StorageDisk.LOCAL,
            }),
          ),
        ),
      ),
    );
  }

  @OnEvent(Events.AVATAR_UPLOAD)
  async onAvatarUpload(event: AvatarUploadEvent) {
    await this.mediaService.insertMediaIn(event.user, {
      file: event.avatar,
      disk: StorageDisk.LOCAL, // TODO - make it dynamic
    });
  }
}
