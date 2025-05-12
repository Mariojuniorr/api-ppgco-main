import { BadRequestException } from '@nestjs/common';
import {
  FileValidationRule,
  UploadedFile,
  ValidationStrategy,
} from './validators.interfaces';

export class RequiredValidationStrategy implements ValidationStrategy {
  validate(files: UploadedFile[], rule: FileValidationRule): void {
    if (rule.required && (!files || files.length === 0)) {
      throw new BadRequestException('Field is required');
    }
  }
}
