import { LocalBucketService } from 'src/local-bucket';
import { STORAGE_PROVIDER } from './storage.constants';

export const storageProviders = [
  {
    provide: STORAGE_PROVIDER,
    useClass: LocalBucketService,
  },
];
