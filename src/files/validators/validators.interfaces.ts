import { UploadedFile } from '../files.types';

export interface FileValidationRule {
  required?: boolean;
  maxCount?: number;
  maxSize?: number;
  allowedTypes?: string[];
}

export interface ValidationStrategy {
  validate(files: UploadedFile[], rule: FileValidationRule): void;
}
