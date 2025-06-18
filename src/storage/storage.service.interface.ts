import { UploadedFile } from 'src/files';
import { StorageDisk } from './storage.enum';

export type BucketFileUpload = {
  file: UploadedFile;
  filename: string;
  originalname: string;
  description?: string;
  password?: string;
  collection_name: string;
};

export interface FileResponse {
  name: string;
  path: string;
  extension: string;
  description: string;
  mimeType: string;
}

export interface IBucketService {
  uploadFile(uploadConfig: BucketFileUpload): Promise<any>;
  deleteFile(filename: string, password?: string): Promise<any>;
  getFile(filename: string, password?: string): Promise<any>;
  getBucketUrl(): string;
  getFileUrl(filename: string, extension?: string): string; // TODO remove this after Media.getUrl() works
  createBucket(name: string): any;
}

export interface ForRootOptions extends Object {
  provider: StorageDisk;
}
