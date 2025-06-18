import { Inject, Injectable } from '@nestjs/common';
import _isEmpty from 'lodash/isEmpty';
import _flatMap from 'lodash/flatMap';
import { MEDIA_REPOSITORY } from './media.constants';
import { Media } from './entities';
import { CreateMediaDto, CreateMediaFromModelDto, UpdateMediaDto } from './dto';
import { Model } from 'sequelize-typescript';

type MediaKeyAttributes =
  | { id: number }
  | { model_type: string; model_id: number };

@Injectable()
export class MediaService {
  public constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaModel: typeof Media,
  ) {}

  public insertMediaIn(model: Model, creationDto: CreateMediaFromModelDto) {
    return this.mediaModel.insertMediaIn(model, creationDto);
  }

  public findOne(where: MediaKeyAttributes) {
    return this.mediaModel.findOne({ where });
  }

  // public create(createMediaDto: CreateMediaDto) {
  //   return this.mediaModel.create({ ...createMediaDto });
  // }

  private async ensureID(where: MediaKeyAttributes) {
    return new Promise<MediaKeyAttributes>((resolve, reject) => {
      if ('id' in where) resolve(where);

      this.findOne(where)
        .then((response) => {
          if (!response) {
            throw new Error('Media ID not found');
          }

          resolve({ id: response.dataValues.id });
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

  public async remove(where: MediaKeyAttributes) {
    return this.mediaModel.destroy({ where: await this.ensureID(where) });
  }
}
