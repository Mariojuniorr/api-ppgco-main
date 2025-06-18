import { Injectable } from '@nestjs/common';
import { Dict } from 'src/core';
import { createHmacHexString, HexString } from 'src/utils';
import { ApiKeyFormatter } from './api-key.formatter';
import { SignatureParts } from './api-key.interfaces';

@Injectable()
export class ApiKeyService {
  constructor(private readonly formatter: ApiKeyFormatter) {}

  public getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000).toString();
  }

  public createRequestSignatureBaseString({
    body,
    path,
    method,
  }: SignatureParts): Dict<string> {
    const upperCaseMethod = this.formatter.formatMethod(method);
    const bodyString = this.formatter.formatBody(body);
    const slashedPath = this.formatter.formatPath(path);

    const currentTimestamp = this.getCurrentTimestamp();
    const signatureBaseString =
      currentTimestamp + upperCaseMethod + slashedPath + bodyString;

    // console.log({ currentTimestamp, upperCaseMethod, slashedPath, bodyString });

    return {
      currentTimestamp,
      signatureBaseString,
    };
  }

  public encryptRequest(
    secretKey: string,
    signatureParts: SignatureParts = {},
  ) {
    const { signatureBaseString, currentTimestamp } =
      this.createRequestSignatureBaseString(signatureParts);

    const requestSignature = new HexString(
      createHmacHexString(secretKey, signatureBaseString),
    );

    return {
      currentTimestamp,
      requestSignature: requestSignature.toString(),
    };
  }
}
