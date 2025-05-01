import { Module } from '@nestjs/common';
import { PpgcoBucketModule } from 'src/ppgco-bucket/ppgco-bucket.module';
import { storageProviders } from './storage.providers';
import { STORAGE_PROVIDER } from './storage.constants';
import { StorageService } from './storage.service';

@Module({
  imports: [PpgcoBucketModule],
  providers: [StorageService, ...storageProviders],
  exports: [StorageService, STORAGE_PROVIDER],
})
export class StorageModule {}
