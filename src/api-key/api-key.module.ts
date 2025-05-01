import { Module } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiKeyFormatter } from './api-key.formatter';

@Module({
  providers: [ApiKeyService, ApiKeyFormatter],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
