import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ApiKeyService } from 'src/api-key';

@Injectable()
export class PpgcoBucketAuthService {
  private readonly auth: AxiosInstance;
  private interceptor: number;

  public constructor(
    private readonly configService: ConfigService,
    private readonly apiKeyService: ApiKeyService,
  ) {
    this.auth = axios.create({
      baseURL: this.configService.get('SERVER_REPORT_API'),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  get apiKeyId() {
    return this.configService.get('PPGCO_BUCKET_API_KEY_ID');
  }

  get apiSecretKey() {
    return this.configService.get('PPGCO_BUCKET_API_SECRET_KEY');
  }

  public setInterceptors(axiosInstace: AxiosInstance) {
    this.interceptor = axiosInstace.interceptors.request.use((config: any) => {
      return {
        ...config,
        headers: {
          ...config.headers,
          ...this.createSignedHeaders(config.method, config.url, config.data),
        },
      };
    });
  }

  public ejectInterceptors(axiosInstace: AxiosInstance) {
    axiosInstace.interceptors.request.eject(this.interceptor);
  }

  public createSignedHeaders(
    method: string,
    path: string,
    body: any,
  ): Record<string, string> {
    const { currentTimestamp, requestSignature } =
      this.apiKeyService.encryptRequest(this.apiSecretKey, {
        method,
        path,
        body,
      });

    return {
      'X-API-Key-ID': this.apiKeyId,
      'X-API-Secret-Key': requestSignature,
      'X-API-Timestamp': currentTimestamp,
    };
  }
}
