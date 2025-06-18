import { Model } from 'sequelize-typescript';

export class ModelWithMedia {
  constructor(private readonly model: Model) {}

  getModelName() {
    return this.model.constructor.name;
  }

  getPrimaryKeyName() {
    return this.model.constructor['primaryKeyAttribute'];
  }

  getPrimaryKey() {
    return this.model.dataValues[this.getPrimaryKeyName()];
  }
}
