import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BucketFileUpload, IBucketService } from 'src/storage';
import { LocalBucketApiService } from '.';
import { objectToFormData, pathJoin } from 'src/utils';
import { ENDPOINTS, uploadFileHeaders } from '../local-bucket.constants';
import { LocalBucketFileUpload } from '../local-bucket.types';

@Injectable()
export class LocalBucketService implements IBucketService {
  constructor(
    private readonly configService: ConfigService,
    private readonly bucketApi: LocalBucketApiService,
  ) {}

  get url() {
    return this.configService.get('LOCAL_BUCKET_URL');
  }

  get bucketKey() {
    return this.configService.get('LOCAL_BUCKET_ID');
  }

  public getBucketUrl(): string {
    return pathJoin(this.url, this.bucketKey);
  }

  public getFileUrl(filename: string, extension: string = ''): string {
    const endpoint = this.bucketApi.resolvePathNames(ENDPOINTS.files.get, {
      bucketKey: this.bucketKey,
      filename: filename + extension,
    });
    return pathJoin(this.url, endpoint);
  } // TODO remove this after Media.getUrl() works

  public async createBucket(name: string) {
    console.log('creating bucket', { endpoint: ENDPOINTS.bucket.create, name });
    return this.bucketApi.attempt(() =>
      this.bucketApi.http.post(ENDPOINTS.bucket.create, { name }),
    );
  }

  public async uploadFile(uploadConfig: LocalBucketFileUpload) {
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

    console.log({ filename, url, bucketKey: this.bucketKey });

    return this.bucketApi.attempt(() => {
      return this.bucketApi.http.get(url, { data: { password } });
    });
  }
}
