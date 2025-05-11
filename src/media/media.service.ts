import { Inject, Injectable } from '@nestjs/common';
import _isEmpty from 'lodash/isEmpty';
import _flatMap from 'lodash/flatMap';
import { MEDIA_REPOSITORY } from './media.constants';
import { Media } from './entities';
import { CreateMediaDto, UpdateMediaDto } from './dto';
import { StorageService } from 'src/storage/storage.service';
import { Attributes, CreateOptions, Transaction } from 'sequelize';
import { Model } from 'sequelize-typescript';
import { StorageDisk } from 'src/storage/storage.enum';
import { DISK } from 'src/storage';

type MediaKeyAttributes =
  | { id: number }
  | { model_type: string; model_id: number };

@Injectable()
export class MediaService {
  public constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaModel: typeof Media,
    private readonly storageService: StorageService,
  ) {}

  public findOne(where: MediaKeyAttributes) {
    return this.mediaModel.findOne({ where });
  }

  public create(
    createMediaDto: CreateMediaDto,
    options: CreateOptions<Attributes<Media>>,
  ) {
    return this.mediaModel.create({ ...createMediaDto }, options);
  }

  public async creatFromMulterFile(
    file: Express.Multer.File,
    metadata: { model: string; key: number; collectionName: string },
    options?: { transaction?: Transaction },
  ) {
    const { model, key, collectionName } = metadata;

    const { name: fileName, extension } = await this.storageService.saveFile(
      file,
      collectionName,
    );

    const fullName = [fileName, extension].join('.');

    return this.create(
      {
        file_name: fullName,
        mime_type: file.mimetype,
        size: file.size,
        extension: extension,
        model_type: model,
        model_id: key,
        collection_name: collectionName,
        name: file.originalname,
        order_column: 1,
        disk: DISK,
      },
      { transaction: options?.transaction },
    );
  }

  private async ensureID(where: MediaKeyAttributes) {
    return new Promise<MediaKeyAttributes>((resolve, reject) => {
      if ('id' in where) resolve(where);

      this.findOne(where)
        .then((response) => {
          resolve({ id: response?.dataValues.id });
        })
        .catch(reject);
    });
  }

  public async update(
    where: MediaKeyAttributes,
    updateMediaDto: UpdateMediaDto,
  ) {
    return this.mediaModel.update(updateMediaDto, {
      where: await this.ensureID(where),
    });
  }

  public async deleteMedia(where: MediaKeyAttributes) {
    // this.storageService.deleteFile(where);
    // return this.mediaModel.destroy({ where: await this.ensureID(where) });
    throw new Error('Method not implemented.');
  }

  // public async uploadFiles(
  //   files: Record<string, Express.Multer.File[]>,
  //   model: HasMedia,
  // ) {
  //   return new Promise<Media | Media[]>(async (resolve, reject) => {
  //     const [firstUpload, ...uploadedFiles] = _flatMap(files, (items) => items);

  //     const resolveWhenIsUnique = (media: Media) => {
  //       if (_isEmpty(uploadedFiles)) resolve(media);
  //     };

  //     await Media.fromMulterFile(firstUpload, model)
  //       .then(resolveWhenIsUnique)
  //       .catch(reject);

  //     const storing = uploadedFiles.map((file) =>
  //       Media.fromMulterFile(file, model),
  //     );

  //     return Promise.all(storing).then(resolve).catch(reject);
  //   });
  // }
}
