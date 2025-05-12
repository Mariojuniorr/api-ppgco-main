import { BadRequestException } from '@nestjs/common';
import {
  FileValidationRule,
  UploadedFile,
  ValidationStrategy,
} from './validators.interfaces';

export class MaxCountValidationStrategy implements ValidationStrategy {
  validate(files: UploadedFile[], rule: FileValidationRule): void {
    if (rule.maxCount && files.length > rule.maxCount) {
      throw new BadRequestException(`Maximum ${rule.maxCount} files allowed`);
    }
  }
}
