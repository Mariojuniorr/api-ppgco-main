import { SignatureParts } from 'src/api-key';
import { BucketFileUpload } from 'src/storage';

export interface PpgcoBucketRequestParts extends SignatureParts {}

export type PpgcoBucketData = {
  name: string;
  description: string;
  isPrivate: boolean;
  active: boolean;
};

export type PpgcoBucketConfig = {
  name?: string;
  key?: string;
};

export type PpgcoBucketClientConfig = {
  credentials: PpgcoBucketAuthServiceConfig;
};

export type PpgcoBucketAuthServiceConfig = {
  accessKeyId: string;
  secretAccessKey: string;
};

export type PpgcoBucketFileUpload = BucketFileUpload;

export type PpgcoBucketRegister = {
  name: string;
  description: string;
  isPrivate: boolean;
  active: boolean;
};

export type PpgcoBucketFileRegister = {
  description: string;
  path: string;
  extension: string;
  name: string;
  mimeType: string;
  updatedAt: string;
  createdAt: string;
};
