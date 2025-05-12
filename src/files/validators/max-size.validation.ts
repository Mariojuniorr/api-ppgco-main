import { BadRequestException } from '@nestjs/common';
import {
  FileValidationRule,
  UploadedFile,
  ValidationStrategy,
} from './validators.interfaces';

export class MaxSizeValidationStrategy implements ValidationStrategy {
  validate(files: UploadedFile[], rule: FileValidationRule): void {
    if (!rule.maxSize) return;

    for (const file of files) {
      if (file.size > rule.maxSize) {
        throw new BadRequestException(
          `File too large. Max size is ${rule.maxSize} bytes`,
        );
      }
    }
  }
}
