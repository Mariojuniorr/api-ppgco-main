import { BadRequestException } from '@nestjs/common';
import {
  FileValidationRule,
  ValidationStrategy,
} from './validators.interfaces';
import { UploadedFile } from '../files.types';

export class FileTypeValidationStrategy implements ValidationStrategy {
  validate(files: UploadedFile[], rule: FileValidationRule): void {
    if (!rule.allowedTypes) return;

    for (const file of files) {
      const isValidType = rule.allowedTypes.some((type) => {
        if (type.endsWith('/*')) {
          return file.mimetype.startsWith(type.split('/')[0]);
        }
        return file.mimetype === type;
      });

      if (!isValidType) {
        throw new BadRequestException(
          `Invalid file type. Allowed types: ${rule.allowedTypes.join(', ')}`,
        );
      }
    }
  }
}
