import { Inject, Injectable } from '@nestjs/common';
import { FileResponse, IBucketService } from './storage.service.interface';
import { STORAGE_PROVIDER } from './storage.constants';
import { pathJoin } from 'src/utils';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly bucketService: IBucketService,
  ) {}

  public getFileUrl(filename: string, extension?: string) {
    return this.bucketService.getFileUrl(filename, extension);
  }

  public async saveFile(
    file: Express.Multer.File,
    filename: string,
    collectionName: string,
    password?: string,
  ): Promise<FileResponse> {
    console.log('saving file');
    return this.bucketService.uploadFile({
      file,
      filename,
      originalname: file.originalname,
      collection_name: collectionName,
      password,
    }) as Promise<FileResponse>;
  }

  public async saveFiles(
    files: Express.Multer.File[],
    collectionName: string,
    password?: string,
  ): Promise<FileResponse[]> {
    return Promise.all(
      files.map((file) => {
        return this.saveFile(
          file,
          file.filename,
          collectionName,
          password,
        ) as Promise<FileResponse>;
      }),
    );
  }

  public async deleteFile(fileName: string, password?: string) {
    return this.bucketService.deleteFile(fileName, password);
  }

  public async getFile(fileName: string, password?: string) {
    return this.bucketService.getFile(fileName, password);
  }

  public getPublicUrl(fileName: string): string {
    return `${this.bucketService.getBucketUrl()}/${fileName}`;
  }
}
