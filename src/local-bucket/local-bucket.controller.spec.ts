import { Test, TestingModule } from '@nestjs/testing';
import { LocalBucketController } from './local-bucket.controller';
import { LocalBucketService } from './services/local-bucket.service';

describe('LocalBucketController', () => {
  let controller: LocalBucketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalBucketController],
      providers: [LocalBucketService],
    }).compile();

    controller = module.get<LocalBucketController>(LocalBucketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
