import { PipeTransform, BadRequestException, Injectable } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      const fieldsWithError = error?.errors
        ?.map((error: any) => `${error.path.join('.')} - ${error.message}`)
        .join(', ');

      throw new BadRequestException(
        `O formulário apresenta um ou mais campos incorretos: ${fieldsWithError}`,
      );
    }
  }
}
