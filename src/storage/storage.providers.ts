import { PpgcoBucketService } from 'src/ppgco-bucket';
import { STORAGE_PROVIDER } from './storage.constants';

export const storageProviders = [
  {
    provide: STORAGE_PROVIDER,
    useClass: PpgcoBucketService,
  },
];
