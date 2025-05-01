import { BucketConfig } from 'src/bucket--outdated';
import {
  BucketFileRegister,
  BucketFileUpload,
} from 'src/bucket--outdated/bucket.types';

export interface BucketCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

export interface Disk {
  createBucket(bucketConfig: BucketConfig): Promise<void>;
  updateBucket(bucketConfig: BucketConfig): Promise<void>;
  uploadFile(
    file: Express.Multer.File,
    password?: string,
    description?: string,
  ): Promise<BucketFileRegister>;
  deleteFile(filename: string, password?: string): Promise<boolean>;
  mountUrl(filename: string): string;
  getFile(filename: string, password?: string): Promise<Blob>;
  setBucketKey(bucketKey: string): this;
  getBucketKey(): string;
}
