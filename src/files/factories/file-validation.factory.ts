import { FileValidation } from '../composite';
import {
  FileValidationRule,
  RequiredValidationStrategy,
  MaxCountValidationStrategy,
  MaxSizeValidationStrategy,
  FileTypeValidationStrategy,
} from '../validators';

export class FileValidationFactory {
  static createValidator(ruleConfig: FileValidationRule): FileValidation {
    const strategies = new FileValidation();

    if (ruleConfig.required !== undefined) {
      strategies.add(new RequiredValidationStrategy());
    }

    if (ruleConfig.maxCount !== undefined) {
      strategies.add(new MaxCountValidationStrategy());
    }

    if (ruleConfig.maxSize !== undefined) {
      strategies.add(new MaxSizeValidationStrategy());
    }

    if (ruleConfig.allowedTypes !== undefined) {
      strategies.add(new FileTypeValidationStrategy());
    }

    return strategies;
  }
}
