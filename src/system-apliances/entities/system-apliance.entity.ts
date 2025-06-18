import {
  AfterCreate,
  AfterUpdate,
  AfterUpsert,
  BeforeCreate,
  BeforeUpdate,
  BeforeUpsert,
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { UploadedFile } from 'src/files';
import { EventManagerService } from 'src/event-manager';
import { Events } from '../system-apliances.enum';
import { CoverUploadEvent } from '../events';

@Table({ tableName: 'system_apliances' })
export class SystemApliance extends Model {
  private static eventEmitter: EventManagerService;

  static injectDependencies(eventEmitter: EventManagerService) {
    SystemApliance.eventEmitter = eventEmitter;
  }

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  sa_key: string;

  @Column
  sa_value: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @Column(DataType.VIRTUAL)
  coverBuffer: UploadedFile;

  static emitUploadedCover(event: CoverUploadEvent) {
    return SystemApliance.eventEmitter.emit(Events.COVER_UPLOAD, event);
  }

  @AfterCreate
  @AfterUpdate
  @AfterUpsert
  static async emitUploadEvent(instance: SystemApliance) {
    if (instance.coverBuffer) {
      console.log('emitting event');
      SystemApliance.emitUploadedCover(
        new CoverUploadEvent(instance, instance.coverBuffer),
      );
    }
  }
}
