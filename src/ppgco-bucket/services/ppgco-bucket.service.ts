import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { objectToFormData, pathJoin } from 'src/utils';
import { ENDPOINTS, uploadFileHeaders } from '../ppgco-bucket.constants';
import { PpgcoBucketApiService } from './ppgco-bucket-api.service';
import {
  PpgcoBucketConfig,
  PpgcoBucketFileUpload,
} from '../ppgco-bucket.types';
import { IBucketService } from 'src/storage';

@Injectable()
export class PpgcoBucketService implements IBucketService {
  constructor(
    private readonly configService: ConfigService,
    private readonly bucketApi: PpgcoBucketApiService,
  ) {}

  get url() {
    return this.configService.get('PPGCO_BUCKET_URL');
  }

  get bucketKey() {
    return this.configService.get('PPGCO_BUCKET_KEY_ID');
  }

  public getBucketUrl(): string {
    return pathJoin(this.url, this.bucketKey);
  }

  public async createBucket(bucketConfig: PpgcoBucketConfig) {
    return this.bucketApi.attempt(() =>
      this.bucketApi.http.post(ENDPOINTS.bucket.create, bucketConfig),
    );
  }

  public async updateBucket(bucketConfig: PpgcoBucketConfig) {
    const endpoint = ENDPOINTS.bucket.update;
    const url = this.bucketApi.resolvePathNames(endpoint, {
      bucketKey: this.bucketKey,
    });

    return this.bucketApi.attempt(() =>
      this.bucketApi.http.post(url, bucketConfig),
    );
  }

  public async uploadFile(uploadConfig: PpgcoBucketFileUpload) {
    const endpoint = ENDPOINTS.files.upload;
    const url = this.bucketApi.resolvePathNames(endpoint, {
      bucketKey: this.bucketKey,
    });

    return this.bucketApi.attempt(() =>
      this.bucketApi.http.post(url, objectToFormData(uploadConfig), {
        headers: uploadFileHeaders,
      }),
    );
  }

  public async deleteFile(filename: string, password?: string) {
    const endpoint = ENDPOINTS.files.upload;
    const url = this.bucketApi.resolvePathNames(endpoint, {
      bucketKey: this.bucketKey,
      filename,
    });

    return this.bucketApi.attempt(() =>
      this.bucketApi.http.post(url, { password }),
    );
  }

  public async getFile(filename: string, password?: string) {
    const endpoint = ENDPOINTS.files.get;
    const url = this.bucketApi.resolvePathNames(endpoint, {
      bucketKey: this.bucketKey,
      filename,
    });

    return this.bucketApi.attempt(() =>
      this.bucketApi.http.get(url, { data: { password } }),
    );
  }
}
