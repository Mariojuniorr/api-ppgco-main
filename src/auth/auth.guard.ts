import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService, User } from 'src/user';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from 'src/core';

export type UserPayload = {
  _id: number;
  email: string;
};

export interface DecodedSsoToken {
  _id?: number;
  email?: string;
  id_pessoa?: string | number;
  cpf?: string;
  name?: string;
  phone_number?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    protected readonly jwtService: JwtService,
    protected readonly reflector: Reflector,
    protected readonly userService: UserService,
    protected readonly configService: ConfigService,
    protected readonly authService: AuthService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const decoded = this.jwtService.decode(token) as DecodedSsoToken | null;
      
      if (!decoded) {
        throw new UnauthorizedException('Token inválido');
      }

      let user: User | null = null;

      // Se NÃO tem _id, assumimos que é o token do SSO da UFU
      if (!decoded._id) {
        console.log(`[SSO Login] Incoming SSO Token received. Calling /userinfo endpoint...`);
        const userInfo = await this.authService.getUserInfo(token);

        console.log(`[SSO Login] Userinfo response:`, userInfo);

        let email = userInfo.email;
        if (email) {
          // Remover qualquer link de mailto ou formatação markdown do email
          email = email.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
          email = email.replace(/^mailto:/i, '').trim();
        }

        const idPessoa = userInfo.id_pessoa ? Number(userInfo.id_pessoa) : null;

        if (!email) {
          throw new UnauthorizedException('Token do SSO inválido: e-mail ausente no userinfo');
        }

        // 1. Buscar usuário local pelo e-mail
        user = await this.userService.findByEmail(email);

        if (user) {
          // Se existir: atualizar automaticamente o id_pessoa
          if (idPessoa && user.id_pessoa !== idPessoa) {
            console.log(`[SSO Sync] Existing user found (ID: ${user.id}). Updating id_pessoa from ${user.id_pessoa} to ${idPessoa}`);
            await this.userService.updateIdPessoa(user.id, idPessoa);
            // Recarregar os dados do usuário para obter o id_pessoa atualizado
            user = await this.userService.findOneWithRoles(user.id);
          } else {
            console.log(`[SSO Sync] Existing user found (ID: ${user.id}) with id_pessoa: ${user.id_pessoa}. No update needed.`);
          }
        } else {
          // Se NÃO existir pelo email: tentar buscar por id_pessoa para garantir idempotência e unicidade
          if (idPessoa) {
            user = await this.userService.findByIdPessoa(idPessoa);
          }

          if (user) {
            // Se encontrou por id_pessoa mas com e-mail diferente, atualiza o e-mail
            if (user.email !== email) {
              console.log(`[SSO Sync] User found by id_pessoa ${idPessoa} but email changed from ${user.email} to ${email}. Updating email.`);
              await this.userService.update(user.id, { email } as any);
              user = await this.userService.findOneWithRoles(user.id);
            }
          } else {
            // Se realmente não existe, cria o usuário automaticamente (JIT)
            console.log(`[SSO Sync] User ${email} not found. Auto-creating user with id_pessoa: ${idPessoa}`);
            const nameParts = (userInfo.name || 'Usuário').split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || 'SSO';

            const dto = {
              first_name: firstName,
              last_name: lastName,
              email: email,
              id_pessoa: idPessoa || undefined,
              cpf: userInfo.sub ? String(userInfo.sub).replace(/\D/g, '') : undefined,
              password: Math.random().toString(36).slice(-10), // Senha aleatória
              birth_date: new Date().toISOString(),
              roles: [], // Papel em branco conforme regra de negócio
            };

            user = await this.userService.create(dto as any);
            console.log(`[SSO Sync] User created successfully (ID: ${user?.id}, email: ${email})`);
          }
        }

      } else {
        // Fluxo normal do Token Local do NestJS
        const payload = await this.jwtService
          .verifyAsync<UserPayload>(token, {
            secret: this.configService.get<string>('JWT_SECRET_KEY'),
          })
          .catch(() => {
            throw new UnauthorizedException('Token expirado');
          });

        if (!payload._id) {
          throw new UnauthorizedException('Token inválido');
        }

        user = await this.userService.findOneWithRoles(payload._id);
      }

      if (!user) {
        throw new InternalServerErrorException('User not authorized');
      }

      request['user'] = user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
