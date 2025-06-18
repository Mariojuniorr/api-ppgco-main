import { UploadedFile } from 'src/files';
import { Media } from '../entities';

export class OnMediaUploadEvent {
  constructor(public readonly media: Media) {}
}
