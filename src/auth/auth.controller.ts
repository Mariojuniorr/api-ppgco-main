import {
  Get,
  Head,
  Body,
  Post,
  HttpCode,
  UsePipes,
  Controller,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import _map from 'lodash/map';
import { BearerToken, Public, ZodValidationPipe } from 'src/core';
import { CurrentUser, User, UserService } from 'src/user';
import { Permission, PermissionsService } from 'src/permissions';
import { AuthService } from './auth.service';
import {
  LoginDto,
  loginSchema,
  AuthResponseDto,
  CheckTokenResponseDto,
  refreshTokenSchema,
  RefreshTokenDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionService: PermissionsService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'User login endpoint', description: 'Authenticates a user and returns a bearer token.' })
  @ApiOkResponse({
    description: `This endpoint is used to autenticate`,
    type: AuthResponseDto,
  })
  @UsePipes(new ZodValidationPipe(loginSchema))
  public signIn(@Body() { email, password }: LoginDto) {
    return this.authService.signIn(email, password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sso')
  @ApiOperation({ summary: 'SSO exchange endpoint', description: 'Exchanges UFU SSO token for local JWT.' })
  public async ssoExchange(@Body() { token }: { token: string }) {
    if (!token) {
      throw new UnauthorizedException('Token do SSO é obrigatório');
    }
    return this.authService.ssoLogin(token);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile', description: 'Returns the logged-in user profile data and permissions.' })
  @ApiOkResponse({
    description: `This endpoint gets logged in user`,
    type: User,
  })
  public async getProfile(@CurrentUser() { dataValues: user }: User) {
    const permissions = await this.permissionService
      .getUserPermissions(user)
      .then((permissions: Permission[]) => {
        return permissions.map(({ name }) => name);
      });

    const lattesUrl = await this.userService.getLattesUrl(user.id);
    const { roles, ...userData } = user;

    return {
      ...userData,
      permissions,
      roles: _map(roles, 'name'),
      lattesUrl,
    };
  }

  @Public()
  @Head('check-token')
  @ApiOperation({ summary: 'Check token validity', description: 'Quickly verifies if the provided token is still valid via HEAD request.' })
  @ApiOkResponse({
    description: `This endpoint checks the validity of the token `,
    type: CheckTokenResponseDto,
  })
  public async check(@BearerToken() token: string) {
    const { hasAccess } = await this.authService.verify(token);

    if (!hasAccess) {
      throw new UnauthorizedException();
    }

    return hasAccess;
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token', description: 'Exchanges a valid refresh token for a new access token.' })
  @ApiOkResponse({
    description: `This endpoint updates access token`,
    type: AuthResponseDto,
  })
  public refresh(
    @Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenDto,
  ) {
    return this.authService.refresh(body);
  }
}
