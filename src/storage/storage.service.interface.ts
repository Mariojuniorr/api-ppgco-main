export type BucketFileUpload = {
  file: Express.Multer.File;
  description: string;
  password?: string;
  collection_name: string;
};

export interface FileResponse {
  name: string;
  path: string;
  extension: string;
  description: string;
  mimeType: string;
}

export interface IBucketService {
  uploadFile(uploadConfig: BucketFileUpload): Promise<any>;
  deleteFile(filename: string, password?: string): Promise<any>;
  getFile(filename: string, password?: string): Promise<any>;
  getBucketUrl(): string;
  //   listFiles(filename: string, password?: string): any; // TODO: implement this
}
