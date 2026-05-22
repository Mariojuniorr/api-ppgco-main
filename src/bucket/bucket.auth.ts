import { ENDPOINTS } from './bucket.constants';
import { AxiosRequestConfig } from 'axios';
import { BucketAuthConfig } from './bucket.types';
import { BucketHttp } from './bucket.http';
import * as crypto from 'crypto';

export class BucketAuth {
  private accessToken: string;
  private refreshToken: string;

  constructor(
    private http: BucketHttp,
    private authConfig: BucketAuthConfig,
  ) {
    this.init();
  }

  private init() {
    const configCb = async (config: AxiosRequestConfig) => {
      return this.configRequestHeaders(config);
    };
    this.http.setRequestInterceptors(configCb);
  }

  private setToken(accessToken: string) {
    this.accessToken = accessToken;
  }

  private setRefreshToken(accessToken: string) {
    this.refreshToken = accessToken;
  }

  public getAccessToken() {
    return this.accessToken;
  }

  public getRefreshToken() {
    return this.refreshToken;
  }

  public getBearerToken() {
    return `Bearer ${this.accessToken}`;
  }

  public getBearerRefreshToken() {
    return `Bearer ${this.refreshToken}`;
  }

  public async authenticate() {
    return { accessToken: '', refreshToken: '' };
  }

  public async isValidToken() {
    return { hasAccess: true };
  }

  public async ensureAuthentication() {
    return { hasAccess: true };
  }

  public setRequestAuthHeader<D = any>(config?: AxiosRequestConfig<D>): any {
    return config?.headers;
  }

  public configRequestHeaders<D = any>(
    config?: AxiosRequestConfig<D>,
  ): AxiosRequestConfig<D> {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const method = (config?.method || 'GET').toUpperCase();

    // Format path
    let urlPath = config?.url || '';
    const cleanPath = urlPath
      .split('?')[0]
      .toUpperCase()
      .replace(/^\/+|\/+$/g, '');
    const pathString = '/' + cleanPath;

    // Format body
    let bodyString = '';
    if (config?.data) {
      if (typeof config.data === 'string') {
        bodyString = config.data;
      } else if (typeof config.data === 'object') {
        const isFormData =
          typeof FormData !== 'undefined' && config.data instanceof FormData;
        const isNodeFormData =
          config.data.constructor &&
          config.data.constructor.name === 'FormData';
        if (isFormData || isNodeFormData) {
          bodyString = '';
        } else {
          bodyString = JSON.stringify(config.data);
        }
      }
    }

    const signatureBase = timestamp + method + pathString + bodyString;
    const signature = crypto
      .createHmac('sha256', this.authConfig.secretAccessKey)
      .update(signatureBase)
      .digest('hex');

    return {
      ...config,
      headers: {
        ...config?.headers,
        'x-api-key-id': this.authConfig.accessKeyId,
        'x-api-secret-key': signature,
        'x-api-timestamp': timestamp,
      } as any,
    };
  }

  public auth() {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  }
}
