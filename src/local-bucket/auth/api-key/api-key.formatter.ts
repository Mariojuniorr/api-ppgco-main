import { Inject, Injectable, Scope } from '@nestjs/common';
import _trim from 'lodash/trim';
import _isEmpty from 'lodash/isEmpty';
import _omitBy from 'lodash/omitBy';

@Injectable()
export class ApiKeyFormatter {
  public formatMethod(method?: string): string {
    if (!method) return '';
    return method.toUpperCase();
  }

  public formatPath(path?: string): string {
    if (!path) return '';
    return '/' + _trim(path.toUpperCase(), ' /');
  }

  public formatBody(body?: any): string {
    const filtredBody = _omitBy(body, (value) => {
      return value === undefined || value === null;
    });

    // console.log({ filtredBody });

    if (!this.hasRequestBody(filtredBody)) {
      return '';
    }

    if (this.isStringBody(body)) {
      return body as string;
    }

    if (this.isObjectBody(body)) {
      return JSON.stringify(body);
    }

    return '';
  }

  private hasRequestBody(body?: any): boolean {
    return !!body && !_isEmpty(body);
  }

  private isStringBody(body?: any): boolean {
    return typeof body === 'string';
  }

  private isObjectBody(body?: any): boolean {
    return typeof body === 'object';
  }
}
