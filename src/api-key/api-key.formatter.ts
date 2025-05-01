import { Inject, Injectable, Scope } from '@nestjs/common';
import _trim from 'lodash/trim';
import _isEmpty from 'lodash/isEmpty';

@Injectable({ scope: Scope.REQUEST })
export class ApiKeyFormatter {
  public formatMethod(method?: string): string {
    if (!method) return '';
    return method.toUpperCase();
  }

  public formatPath(path?: string): string {
    if (!path) return '';
    return '/' + _trim(path.toUpperCase(), ' /');
  }

  public formatBody(body?: string): string {
    if (!this.hasRequestBody(body)) {
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

  private hasRequestBody(body?: string): boolean {
    return !!body && !_isEmpty(body);
  }

  private isStringBody(body?: string): boolean {
    return typeof body === 'string';
  }

  private isObjectBody(body?: string): boolean {
    return typeof body === 'object';
  }
}
