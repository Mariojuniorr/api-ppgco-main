import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalBucketService } from './services/local-bucket.service';
import { ApiKeyFormatter, ApiKeyService } from './auth';
import { LocalBucketApiService, LocalBucketAuthService } from './services';

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('LOCAL_BUCKET_URL'),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    ApiKeyFormatter,
    ApiKeyService,
    LocalBucketAuthService,
    LocalBucketApiService,
    LocalBucketService,
  ],
  exports: [
    LocalBucketService,
    ApiKeyFormatter,
    ApiKeyService,
    LocalBucketAuthService,
    LocalBucketApiService,
  ],
})
export class LocalBucketModule {}
