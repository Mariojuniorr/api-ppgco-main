import {
  DynamicModule,
  Global,
  Module,
  NotImplementedException,
  Provider,
} from '@nestjs/common';
import {
  LocalBucketApiService,
  LocalBucketModule,
  LocalBucketService,
} from 'src/local-bucket';
import { STORAGE_PROVIDER } from './storage.constants';
import { StorageService } from './storage.service';
import { ForRootOptions } from './storage.service.interface';
import { StorageDisk } from './storage.enum';
import { DEFAULT_STORAGE_DISK } from 'src/core';

@Global()
@Module({})
export class StorageModule {
  static forRoot(
    options: ForRootOptions = { provider: DEFAULT_STORAGE_DISK },
  ): DynamicModule {
    const bucketProvider: Provider = {
      provide: STORAGE_PROVIDER,
      useClass: this.getBucketServiceClass(options.provider),
    };

    return {
      module: StorageModule,
      imports: [LocalBucketModule],
      providers: [StorageService, bucketProvider],
      exports: [StorageService],
    };
  }

  private static getBucketServiceClass(provider: string) {
    if (provider !== StorageDisk.LOCAL) {
      throw new NotImplementedException(`Disk not implemented: ${provider}`);
    }

    const buckets = {
      local: LocalBucketService,
      default: LocalBucketService,
    };

    return buckets[provider] || buckets.default;
  }
}
