import { Test, TestingModule } from '@nestjs/testing';
import { PpgcoBucketService } from './ppgco-bucket.service';

describe('PpgcoBucketService', () => {
  let service: PpgcoBucketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PpgcoBucketService],
    }).compile();

    service = module.get<PpgcoBucketService>(PpgcoBucketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
