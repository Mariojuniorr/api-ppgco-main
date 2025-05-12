export type UploadedFile = Express.Multer.File;

export interface FileValidationRule {
  required?: boolean;
  maxCount?: number;
  maxSize?: number;
  allowedTypes?: string[];
}

export interface ValidationStrategy {
  validate(files: UploadedFile[], rule: FileValidationRule): void;
}
