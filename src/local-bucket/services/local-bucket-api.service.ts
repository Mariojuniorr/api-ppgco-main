import { HttpService } from '@nestjs/axios';
import _template from 'lodash/template';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { LocalBucketUnavailableException } from '../exceptions';
import { LocalBucketAuthService } from './local-bucket-auth.service';

@Injectable()
export class LocalBucketApiService {
  constructor(
    private readonly bucketApi: HttpService,
    private readonly bucketAuth: LocalBucketAuthService,
  ) {}

  public setInterceptors() {
    this.bucketAuth.setInterceptors(this.bucketApi.axiosRef);
  }

  public ejectInterceptors() {
    this.bucketAuth.ejectInterceptors(this.bucketApi.axiosRef);
  }

  public resolvePathNames(path: string, replaces: Record<string, string>) {
    const resolver = _template(path);
    return resolver(replaces);
  }

  public async attempt(getRequest: () => Observable<AxiosResponse<any, any>>) {
    this.setInterceptors();

    const { data } = await firstValueFrom(
      getRequest().pipe(catchError(this.handleApiError.bind(this))),
    );

    this.ejectInterceptors();

    return data;
  }

  public handleApiError(error: AxiosError<any>) {
    throw new LocalBucketUnavailableException(error);
  }

  get http() {
    return this.bucketApi;
  }
}
