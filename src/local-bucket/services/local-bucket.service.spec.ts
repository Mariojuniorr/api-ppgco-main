import { Test, TestingModule } from '@nestjs/testing';
import { LocalBucketService } from './local-bucket.service';

describe('LocalBucketService', () => {
  let service: LocalBucketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalBucketService],
    }).compile();

    service = module.get<LocalBucketService>(LocalBucketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
