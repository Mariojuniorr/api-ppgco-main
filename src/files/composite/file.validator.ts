import { UploadedFile } from '../files.types';
import { FileValidationRule, ValidationStrategy } from '../validators';

export class FileValidation implements ValidationStrategy {
  private strategies: ValidationStrategy[] = [];

  add(strategy: ValidationStrategy): void {
    this.strategies.push(strategy);
  }

  validate(files: UploadedFile[], rule: FileValidationRule): void {
    for (const strategy of this.strategies) {
      strategy.validate(files, rule);
    }
  }
}
