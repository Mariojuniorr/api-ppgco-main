import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBucketService } from 'src/storage';

@Injectable()
export class StorageService {
  constructor(
    @Inject('BUCKET_SERVICE')
    private readonly bucketService: IBucketService,
    private readonly configService: ConfigService,
  ) {}
}
