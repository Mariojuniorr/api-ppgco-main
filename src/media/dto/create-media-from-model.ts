import { UploadedFile } from 'src/files';
import { StorageDisk } from 'src/storage';

export interface CreateMediaFromModelDto {
  file: UploadedFile;
  disk?: StorageDisk;
}
