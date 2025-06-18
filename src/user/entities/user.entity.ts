import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  AfterCreate,
  AfterFind,
  AfterSync,
  AfterUpdate,
  BelongsToMany,
  Column,
  CreatedAt,
  DefaultScope,
  DeletedAt,
  HasMany,
  HasOne,
  Model,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import _first from 'lodash/first';
import _trimStart from 'lodash/trimStart';
import _trimEnd from 'lodash/trimEnd';
import _snakeCase from 'lodash/snakeCase';
import { Role } from 'src/roles/entities';
import { UserHasRole } from 'src/user-has-roles/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '../user.enum';
import { UploadedFile } from 'src/files';
import { EventManagerService } from 'src/event-manager';
import { AvatarUploadEvent, FileUploadEvent } from '../events';
import { Media } from 'src/media';

@Scopes(() => ({
  full: {
    include: [Role],
  },
  withRoles: {
    include: [Role],
  },
  withoutSensiveData: {
    attributes: {
      exclude: [
        'password',
        'remember_token',
        'email_verified_at',
        'activated',
        'forbidden',
      ],
    },
  },
}))
@DefaultScope(() => ({
  attributes: {
    exclude: ['password'],
  },
}))
@Table({ tableName: 'users' })
export class User extends Model {
  private static eventEmitter: EventManagerService;

  static injectDependencies(eventEmitter: EventManagerService) {
    User.eventEmitter = eventEmitter;
  }

  @Column
  first_name: string;

  @Column
  last_name: string;

  @Column
  email: string;

  @Column
  phone: string;

  @Column
  @ApiHideProperty()
  password: string;

  @Column
  remember_token: string;

  @Column
  email_verified_at: Date;

  @Column
  last_login_at: Date;

  @Column
  activated: boolean;

  @Column
  forbidden: boolean;

  @Column
  language: string;

  @Column
  birth_date: Date;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  @BelongsToMany(() => Role, () => UserHasRole)
  roles: Role[];

  @HasMany(() => UserHasRole)
  userHasRole: UserHasRole;

  @Column(DataTypes.VIRTUAL)
  avatarBuffer: UploadedFile;

  @Column(DataTypes.VIRTUAL)
  avatar: Media | null;

  @AfterFind
  public static async getAvatar(instance: User) {
    if (!instance) return;

    instance.avatar = await Media.findFromModel(instance, {
      order: [['id', 'desc']],
    });
  }

  // @AfterFind
  // public static formatFones(instance: User) {
  //   console.log({ user: instance });
  //   console.log({ phone: formatFones(instance.dataValues.phone ?? '') });
  //   instance.dataValues.phone = formatFones(instance.dataValues.phone ?? '');
  // }

  @Column(DataTypes.VIRTUAL)
  public get full_name() {
    return (
      this.getDataValue('first_name') + ' ' + this.getDataValue('last_name')
    );
  }

  public is(...roleNames: string[]) {
    const counterRoles = (accum: number, role: Role) => {
      return accum + +roleNames.includes(role.dataValues.name);
    };
    const roles = this.getDataValue('roles');
    const count = roles.reduce(counterRoles, 0);

    return count === roleNames.length;
  }

  static emitUploadedAvatar(event: AvatarUploadEvent) {
    return User.eventEmitter.emit(Events.AVATAR_UPLOAD, event);
  }

  @AfterCreate
  @AfterUpdate
  static async emitUploadEvent(instance: User) {
    if (instance.avatarBuffer) {
      User.emitUploadedAvatar(
        new AvatarUploadEvent(instance, instance.avatarBuffer),
      );
    }
  }
}
