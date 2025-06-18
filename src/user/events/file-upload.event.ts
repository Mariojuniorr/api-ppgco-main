import { UploadedFile } from 'src/files';
import { User } from '../entities';
import { Dict } from 'src/core';

export class FileUploadEvent {
  constructor(
    public readonly user: User,
    public readonly files: Dict<UploadedFile[]>,
  ) {}
}
