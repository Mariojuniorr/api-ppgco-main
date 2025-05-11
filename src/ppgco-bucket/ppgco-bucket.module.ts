import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiKeyModule } from 'src/api-key';
import { PpgcoBucketService } from './services/ppgco-bucket.service';
import { PpgcoBucketApiService, PpgcoBucketAuthService } from './services';

@Module({
  imports: [
    ApiKeyModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('PPGCO_BUCKET_API'),
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
    PpgcoBucketAuthService,
    PpgcoBucketApiService,
    PpgcoBucketService,
  ],
  exports: [PpgcoBucketAuthService, PpgcoBucketApiService, PpgcoBucketService],
})
export class PpgcoBucketModule {}
