import { ServiceUnavailableException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { errorPreffix } from '../local-bucket.constants';

export class LocalBucketUnavailableException extends ServiceUnavailableException {
  constructor(error: AxiosError<any>) {
    const { response } = error as AxiosError<any>;

    const description = response?.data?.message || error.message;
    const message = errorPreffix + description;

    super(message, { cause: error, description });
  }
}
