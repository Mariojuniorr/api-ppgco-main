import {
  Column,
  CreatedAt,
  Table,
  UpdatedAt,
  BeforeCreate,
  BeforeSave,
  Model,
  AfterCreate,
  AfterUpdate,
} from 'sequelize-typescript';
import { DEFAULT_STORAGE_DISK } from 'src/core';
import { UploadedFile } from 'src/files';
import { StorageDisk, StorageService } from 'src/storage';
import { generateUUID, pathJoin } from 'src/utils';
import { CreateMediaFromModelDto } from '../dto/create-media-from-model';
import { User } from 'src/user';
import { EventManagerService } from 'src/event-manager';
import { Events } from '../media.enum';
import { OnMediaUploadEvent } from '../events';
import { Attributes, DataTypes, FindOptions } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { ConfigService } from '@nestjs/config';
import { ModelWithMedia } from './model-with-media.entity';

export interface MediaInputData {
  name: string;
  filename: string;
  mime_type: string;
  disk: string;
  size: number;
}

@Table({ tableName: 'media' })
export class Media extends Model<Media> {
  private static eventEmitter: EventManagerService;
  private static storageService: StorageService;

  static injectDependencies(
    storageService: StorageService,
    eventEmitter: EventManagerService,
  ) {
    Media.storageService = storageService;
    Media.eventEmitter = eventEmitter;
  }

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ field: 'model_type' })
  modelType: string;

  @Column({ field: 'model_id' })
  modelId: number;

  @Column
  uuid: string;

  @Column({ field: 'collection_name' })
  collectionName: string;

  @Column
  name: string;

  @Column({ field: 'file_name' })
  filename: string;

  @Column({ field: 'mime_type' })
  mimeType: string;

  @Column
  disk: string;

  @Column
  size: number;

  @Column
  order_column: number;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @Column(DataTypes.VIRTUAL)
  mediaBuffer: UploadedFile;

  @BeforeSave
  @BeforeCreate
  static beforeCreateTreatment(instance: Media) {
    instance.uuid = generateUUID();
  }

  public getFilename() {
    return this.getDataValue('uuid') + this.getExtension();
  }

  public getExtension() {
    return path.extname(this.getDataValue('name'));
  }

  public getUrl() {
    return Media.storageService.getFileUrl(this.getFilename());
  }

  static insertMediaIn(model: Model, creationDto: CreateMediaFromModelDto) {
    const { file, disk } = creationDto;

    console.log({ model });

    const media = new Media();
    const modelWithMedia = new ModelWithMedia(model);

    media.modelType = modelWithMedia.getModelName();
    media.modelId = modelWithMedia.getPrimaryKey();
    media.collectionName = file.fieldname;
    media.name = file.originalname;
    media.mimeType = file.mimetype;
    media.size = file.size;
    media.order_column = 1;
    media.disk = disk || DEFAULT_STORAGE_DISK;
    media.mediaBuffer = file;

    return media.save();
  }

  static async findFromModel(
    model: Model,
    options: FindOptions<Attributes<Media>> = {},
  ) {
    const modelWithMedia = new ModelWithMedia(model);
    const media = await Media.findOne({
      where: {
        modelId: modelWithMedia.getPrimaryKey(),
        modelType: modelWithMedia.getModelName(),
      },
      ...options,
    });

    return media;
  }

  static emitUploadedMedia(event: OnMediaUploadEvent) {
    return Media.eventEmitter.emit(Events.UPLOAD_MEDIA, event);
  }

  @BeforeCreate
  static async mountFilename(instance: Media) {
    const extension = path.extname(instance.name);
    instance.filename = instance.uuid + extension;
  }

  @AfterCreate
  @AfterUpdate
  static async emitUploadEvent(instance: Media) {
    if (instance.mediaBuffer) {
      Media.emitUploadedMedia(new OnMediaUploadEvent(instance));
    }
  }
}
