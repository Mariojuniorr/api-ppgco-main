import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import _map from 'lodash/map';
import _pick from 'lodash/pick';

import { Permission, PermissionsService } from 'src/permissions';
import { User, UserService } from 'src/user';
import { UsersPasswordResetService } from 'src/users-password-reset';

type TokenType = {
  _id: number;
  email: string;
  name: string;
};

export type DecodedToken = {
  _id: number;
  email: string;
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  public constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly permissionService: PermissionsService,
  ) { }

  public async signIn(email: string, password: string): Promise<any> {
    const user = (await this.usersService.findByEmail(email)) as User & {
      getPermissions: () => Promise<Permission[]>;
    };

    if (!user) {
      throw new ForbiddenException();
    }

    const {
      password: storedPassword,
      id: userId,
      roles,
      ...userData
    } = user.dataValues;

    if (!bcrypt.compareSync(password, storedPassword)) {
      throw new UnauthorizedException();
    }

    if (userData.forbidden) {
      throw new ForbiddenException('Forbidden access');
    }

    if (!userData.activated) {
      throw new UnauthorizedException('Activate your account before sign in');
    }

    const payload = {
      _id: userId,
      email,
      name: user.full_name,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '4h',
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
    });

    this.usersService.setLastLogin(user);

    const permissions = await this.permissionService
      .getUserPermissions(user)
      .then((permissions: Permission[]) => {
        return permissions.map(({ name }) => name);
      });

    return {
      auth: { accessToken, refreshToken },
      user: {
        ...this.usersService.omitSensitiveData(user),
        roles: _map(roles, 'name'),
        permissions,
      },
    };
  }

  private extractTokenFromAuthorization(authorization: string): string {
    const [type, token] = authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : '';
  }

  public async verify(authorization: string | undefined | null) {
    try {
      if (!authorization) {
        throw new Error();
      }

      const hasAccess = this.jwtService.verify(
        this.extractTokenFromAuthorization(authorization),
      );

      return { hasAccess };
    } catch (error) {
      return { hasAccess: false };
    }
  }

  public async refresh(requestBody: any) {
    const token = requestBody.refreshToken;

    const secretKeys = {
      access: this.configService.get<string>('JWT_SECRET_KEY'),
      refresh: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
    };

    const payload = await this.jwtService.verifyAsync<TokenType>(token, {
      secret: secretKeys.refresh,
    });

    const newPayload = _pick(payload, ['_id', 'email', 'name']);

    if (!(await this.usersService.exists(payload._id))) {
      throw new ForbiddenException();
    }

    const accessToken = await this.jwtService.signAsync(newPayload, {
      expiresIn: '4h',
      secret: secretKeys.access,
    });

    const refreshToken = await this.jwtService.signAsync(newPayload, {
      expiresIn: '4h',
      secret: secretKeys.access,
    });

    return { auth: { accessToken, refreshToken } };
  }

  public async ssoLogin(ssoToken: string): Promise<any> {
    console.log(`[SSO Login Endpoint] Exchanging SSO token for local JWT...`);
    const userInfo = await this.getUserInfo(ssoToken);
    
    let email = userInfo.email;
    if (email) {
      email = email.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      email = email.replace(/^mailto:/i, '').trim();
    }
    
    const idPessoa = userInfo.id_pessoa ? Number(userInfo.id_pessoa) : null;
    console.log(`[SSO Login Endpoint] Resolved email: "${email}", id_pessoa: ${idPessoa}`);
    
    if (!email) {
      throw new UnauthorizedException('Token do SSO inválido: e-mail ausente');
    }
    
    // 1. Buscar ou criar/sincronizar usuário local
    let user = await this.usersService.findByEmail(email);
    console.log(`[SSO Login Endpoint] Search user by email "${email}":`, user ? `Found (ID: ${user.id}, id_pessoa: ${user.id_pessoa})` : 'Not found');
    
    if (user) {
      if (idPessoa && user.id_pessoa !== idPessoa) {
        console.log(`[SSO Login Endpoint] Updating id_pessoa for user ID ${user.id} to ${idPessoa}`);
        await this.usersService.updateIdPessoa(user.id, idPessoa);
        user = await this.usersService.findOneWithRoles(user.id);
      }
    } else {
      if (idPessoa) {
        user = await this.usersService.findByIdPessoa(idPessoa);
      }
      
      if (user) {
        if (user.email !== email) {
          console.log(`[SSO Login Endpoint] Updating email for user ID ${user.id} to ${email}`);
          await this.usersService.update(user.id, { email } as any);
          user = await this.usersService.findOneWithRoles(user.id);
        }
      } else {
        console.log(`[SSO Login Endpoint] JIT provisioning for user: ${email}`);
        const nameParts = (userInfo.name || 'Usuário').split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || 'SSO';
        
        const dto = {
          first_name: firstName,
          last_name: lastName,
          email: email,
          id_pessoa: idPessoa || undefined,
          password: Math.random().toString(36).slice(-10),
          birth_date: new Date().toISOString(),
          roles: ['Estudante'],
        };
        
        user = await this.usersService.create(dto as any);
      }
    }
    
    if (!user) {
      throw new UnauthorizedException('Falha na sincronização do usuário');
    }
    
    const {
      id: userId,
      roles,
    } = user.dataValues;
    
    const payload = {
      _id: userId,
      email,
      name: user.full_name,
    };
    
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '4h',
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
    });
    
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
    });
    
    this.usersService.setLastLogin(user);
    
    const permissions = await this.permissionService
      .getUserPermissions(user)
      .then((permissions: Permission[]) => {
        return permissions.map(({ name }) => name);
      });
      
    console.log(`[SSO Login Endpoint] Local JWT successfully generated for user ID ${userId}`);
    return {
      auth: { accessToken, refreshToken },
      user: {
        ...this.usersService.omitSensitiveData(user),
        roles: _map(roles, 'name'),
        permissions,
      },
    };
  }

  public async getUserInfo(token: string): Promise<SsoUserInfo> {
    const userinfoUrl = this.configService.get<string>('SSO_USERINFO_URL') || 'https://acesso-hom.ufu.br/userinfo';
    try {
      const response = await fetch(userinfoUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${bodyText}`);
      }

      const data = await response.json() as SsoUserInfo;
      console.log('[SSO Userinfo Response]:', data);
      return data;
    } catch (error) {
      console.error('[SSO Userinfo Error]: Failed to fetch userinfo:', error);
      throw new UnauthorizedException('Falha ao obter informações do usuário a partir do SSO');
    }
  }
}

export interface SsoUserInfo {
  sub: string;
  name?: string;
  email: string;
  id_pessoa?: number | string;
  roles?: string[];
  perfis?: string;
}
