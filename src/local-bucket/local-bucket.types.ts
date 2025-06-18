import { SignatureParts } from './auth';
import { BucketFileUpload } from 'src/storage';

export interface LocalBucketRequestParts extends SignatureParts {}

export type LocalBucketData = {
  name: string;
  description: string;
  isPrivate: boolean;
  active: boolean;
};

export type LocalBucketClientConfig = {
  credentials: LocalBucketAuthServiceConfig;
};

export type LocalBucketAuthServiceConfig = {
  accessKeyId: string;
  secretAccessKey: string;
};

export type LocalBucketFileUpload = BucketFileUpload;

export type LocalBucketRegister = {
  name: string;
  description: string;
  isPrivate: boolean;
  active: boolean;
};

export type LocalBucketFileRegister = {
  description: string;
  path: string;
  extension: string;
  name: string;
  mimeType: string;
  updatedAt: string;
  createdAt: string;
};
