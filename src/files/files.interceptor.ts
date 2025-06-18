import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { FileValidationRule } from './validators';
import _groupBy from 'lodash/groupBy';
import { FileValidationFactory } from './factories';
import { UploadedFile } from './files.types';

@Injectable()
export class FileCollectionValidationInterceptor implements NestInterceptor {
  constructor(
    private readonly validationRules: Record<string, FileValidationRule>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const groupedFiles = _groupBy<UploadedFile>(request.files, 'fieldname');

    for (const fieldname in groupedFiles) {
      const filesArray = groupedFiles[fieldname];
      const rules = this.validationRules[fieldname];

      console.log({ rules });

      if (rules) {
        this.validateFiles(filesArray, rules, fieldname);
      }
    }

    request.fileCollections = groupedFiles;

    return next.handle().pipe(map((data) => data));
  }

  private createValidator(rules: FileValidationRule) {
    return FileValidationFactory.createValidator(rules);
  }

  private validateFiles(
    files: UploadedFile[],
    rules: FileValidationRule,
    fieldname: string,
  ) {
    try {
      this.createValidator(rules).validate(files, rules);
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new BadRequestException(error.message, { cause: error });
      }

      if (error instanceof BadRequestException) {
        throw new BadRequestException(`${fieldname}: ${error.message}`, {
          cause: error,
        });
      }

      throw error;
    }
  }
}
