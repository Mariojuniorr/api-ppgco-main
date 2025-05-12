import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { fileProviders } from './files.providers';

@Module({
  providers: [FilesService, ...fileProviders],
})
export class FilesModule {}
