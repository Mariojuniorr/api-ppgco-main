import { UploadedFile } from 'src/files';
import { User } from '../entities';
import { Dict } from 'src/core';

export class AvatarUploadEvent {
  constructor(
    public readonly user: User,
    public readonly avatar: UploadedFile,
  ) {}
}
