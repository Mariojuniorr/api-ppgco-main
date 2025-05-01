import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  AfterCreate,
  AfterFind,
  AfterSync,
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
import { Media } from 'src/media/entities';

interface constructor<T> {
  new (...args: any[]): T;
}

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
@Table({ tableName: 'users' })
export class User extends Model<User> {
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

  @ApiProperty({})
  @Column({
    type: DataTypes.VIRTUAL,
    get() {
      const avatarRef = (this as any).avatarRef;
      return avatarRef ? avatarRef.media : null;
    },
  })
  avatar: any;

  @HasOne(() => Media, {
    foreignKey: 'entityId',
    constraints: false,
    scope: {
      entityType: 'user',
      referenceType: 'avatar',
    },
    as: 'avatarRef',
  })
  avatarRef: Media;

  // public registerMediaCollections(): void {
  //   this.mediaCollection.addMediaCollection('avatar');
  // }

  // public async getAvatar() {
  //   const medias = await this.getMedias('avatar');
  //   return medias[0];
  // }

  // public async getAvatarUrl() {
  //   return _first(await this.getMediaUrl('avatar'));
  // }

  public is(...roleNames: string[]) {
    const counterRoles = (accum: number, role: Role) => {
      return accum + +roleNames.includes(role.dataValues.name);
    };
    const roles = this.getDataValue('roles');
    const count = roles.reduce(counterRoles, 0);

    return count === roleNames.length;
  }
}
