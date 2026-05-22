import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { CommonService } from 'src/core';
import { User } from 'src/user';
import { RoleHasPermission } from 'src/role-has-permissions';
import { Op } from 'sequelize';
import { Role } from 'src/roles';
import { UserHasPermission } from 'src/user-has-permissions';
import { PERMISSIONS_REPOSITORY } from './permissions.constants';
import { Permission } from './entities';
import { CreatePermissionsDto, UpdatePermissionsDto } from './dto';

@Injectable()
export class PermissionsService extends CommonService<
  Permission,
  typeof Permission
> {
  public constructor(@Inject(PERMISSIONS_REPOSITORY) model: typeof Permission) {
    super(model);
  }

  public async getUserPermissions(user: User): Promise<Permission[]> {
    const roleIds = user.roles && user.roles.length > 0
      ? user.roles.map((role: Role) => role.dataValues.id)
      : [];

    if (roleIds.length === 0) {
      return this.model.findAll({
        include: [
          {
            model: UserHasPermission,
            required: true,
            where: { model_id: user.id },
          },
        ],
      });
    }

    const sql = `
      SELECT DISTINCT p.*
      FROM permissions p
      LEFT JOIN role_has_permissions rhp ON p.id = rhp.permission_id
      LEFT JOIN user_has_permissions uhp ON p.id = uhp.permission_id
      WHERE rhp.role_id IN (:roleIds) OR uhp.model_id = :userId
    `;

    return this.model.sequelize!.query(sql, {
      replacements: { roleIds, userId: user.id },
      model: this.model,
      mapToModel: true,
    });
  }

  public findByName(name: string, guardName: string) {
    return this.model.findOne({
      where: { name, guard_name: guardName },
    });
  }

  public create(createPermissionsDto: CreatePermissionsDto) {
    return this.model.create({ ...createPermissionsDto });
  }

  public bulkCreate(bulkCreatePermissionsDto: CreatePermissionsDto[]) {
    return this.model.bulkCreate(
      bulkCreatePermissionsDto.map(
        (createPermissionsDto: CreatePermissionsDto) => ({
          ...createPermissionsDto,
        }),
      ),
      { returning: true },
    );
  }

  public update(id: number, updatePermissionsDto: UpdatePermissionsDto) {
    return this.model.update(updatePermissionsDto, { where: { id } });
  }

  public remove(_id: number) {
    throw new NotImplementedException();
  }
}
