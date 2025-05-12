import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class FileListener {
  @OnEvent('user.file.upload')
  onFileUpload(event: any) {
    console.log({ event });
  }
}
