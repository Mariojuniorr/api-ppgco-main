import {
  createParamDecorator,
  ExecutionContext,
  applyDecorators,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileValidationRule } from './validators';
import { Dict } from 'src/core';
import { FileCollectionValidationInterceptor } from './files.interceptor';
import { UploadedFile } from './files.types';

export const UploadedFileCollections = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return (request.fileCollections || {}) as Dict<Array<UploadedFile>>;
  },
);

export function FileCollectionsInterceptor(
  collections: Dict<FileValidationRule>,
) {
  return applyDecorators(
    UseInterceptors(
      AnyFilesInterceptor(),
      new FileCollectionValidationInterceptor(collections),
    ),
  );
}
