import {
  createParamDecorator,
  ExecutionContext,
  applyDecorators,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileValidationRule, UploadedFile } from './validators';
import { Dict } from 'src/core';
import { FileCollectionValidationInterceptor } from './files.interceptor';

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
