import { Module } from '@nestjs/common';
import { PpgcoBucketService } from './services/ppgco-bucket.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiKeyModule } from 'src/api-key';

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
  providers: [PpgcoBucketService],
  exports: [PpgcoBucketService],
})
export class PpgcoBucketModule {}
