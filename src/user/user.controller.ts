import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  BadRequestException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import {
  dayjs,
  Filters,
  OrderDto,
  Public,
  ZodValidationPipe,
  DeleteSuccessResponse,
  UpdateSuccessResponse,
} from 'src/core';
import { UsersPasswordResetService } from 'src/users-password-reset';
import {
  UploadedMediaValidationPipe,
  UseMediaValidatorInterceptor,
} from 'src/media';
import { Can } from 'src/permissions';
import { randomString } from 'src/utils';
import { UserService } from './user.service';
import { User } from './entities';
import {
  createUserSchema,
  UpdateUserDto,
  PaginatedUserDto,
  resetPasswordFormSchema,
  ResetPasswordSchemaDto,
  ForgotPasswordDto,
  forgotPasswordSchema,
} from './dto';
import { COLLECTIONS } from './user.constants';
import { Permissions } from './user.enum';

@Controller('users')
export class UserController {
  public constructor(
    private readonly userService: UserService,
    // private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersPasswordResetService: UsersPasswordResetService,
  ) {}

  // TODO fix this
  // @Post('upload-file')
  // @Can(Permissions.Create)
  // @UseMediaValidatorInterceptor(COLLECTIONS)
  // @ApiCreatedResponse({ type: User })
  // uploadFileAndPassValidation(
  //   @CurrentUser() user: User,
  //   @UploadedFiles(UploadedMediaValidationPipe(COLLECTIONS))
  //   files: Record<string, Express.Multer.File[]>,
  // ) {
  //   if (!files) {
  //     throw new BadRequestException('No files sent');
  //   }
  //   return user.saveFiles(files);
  // }

  @Post()
  @Can(Permissions.Create)
  @UseMediaValidatorInterceptor(COLLECTIONS)
  @ApiCreatedResponse({ type: User })
  createUser(
    @Body(new ZodValidationPipe(createUserSchema)) createUserDto: any,
    @UploadedFiles(UploadedMediaValidationPipe(COLLECTIONS))
    files?: Record<string, Express.Multer.File[]>,
  ) {
    const password =
      createUserDto.password === 'generate_default'
        ? randomString(8)
        : createUserDto.password;

    const mailData =
      createUserDto.password === 'generate_default'
        ? `Sua senha é <b>${password}</b>. Altere sua senha no primeiro acesso.<br />`
        : undefined;

    const dto = { ...createUserDto, password };

    return this.userService.create(dto, { files, mailData });
  }

  @Get()
  @Can(Permissions.List)
  @ApiOkResponse({ type: PaginatedUserDto })
  public findAll(
    @Query('page') page: string,
    @Query('perPage') perPage: string,
    @Query('search') search: string,
    @Query('searchIn') searchIn: string,
    @Query('orderBy') order: OrderDto[],
    @Query('filters') filters: Filters,
  ) {
    console.log({ filters });
    return this.userService.find(
      +page,
      +perPage,
      search,
      searchIn,
      order,
      filters,
    );
  }

  @Get(':id')
  @Can(Permissions.Read)
  @ApiOkResponse({ type: User })
  public async findOne(@Param('id') id: string[]) {
    const user = await this.userService.findOneWithoutSensiteData(+id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // const avatar = await user.getAvatarUrl();
    const avatar = {}; // TODO fix this

    return { ...user, avatar };
  }

  @Patch(':id')
  @Can(Permissions.Update)
  @ApiOkResponse({ type: UpdateSuccessResponse })
  public update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updateds = this.userService.update(+id, updateUserDto);

    return {
      status: 'success',
      message: 'User updated successfully',
      updateds,
    };
  }

  @Delete(':id')
  @Can(Permissions.Delete)
  @ApiOkResponse({ type: DeleteSuccessResponse })
  public remove(@Param('id') id: string) {
    const deleteds = this.userService.remove(+id);
    return {
      status: 'success',
      message: 'User deleted successfully',
      deleteds,
    };
  }

  // TODO: fix endpoints in frontend (from /reset-password/* to users/*)

  @Public()
  @Post('/forgot-password')
  public async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema))
    { email }: ForgotPasswordDto,
  ) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Password reset link could not be sent');
    }

    await this.userService.sendForgotPasswordEmail(user);

    return {
      status: 'success',
      message: 'Password reset link has been sent',
    };
  }

  @Public()
  @Get('/validate-token/:token')
  public async validatePasswordResetToken(@Param('token') token: string) {
    const data = await this.usersPasswordResetService.findOne(token);

    if (!data) {
      throw new NotFoundException('Token não encontrado');
    }

    if (data.is_expired) {
      throw new BadRequestException('Token expirado');
    }

    const createdAt = dayjs(data.created_at);
    const expiresIn = this.configService.get('PASSWORD_RESET_TOKEN_EXPIRATION');

    console.log({
      expiresIn,
      createdAt: dayjs(data.created_at).format('YYYY-MM-DD HH:mm:ssZ[Z]'),
      expires: dayjs(data.created_at)
        .add(expiresIn, 'second')
        .format('YYYY-MM-DD HH:mm:ssZ[Z]'),
      now: dayjs().format('YYYY-MM-DD HH:mm:ssZ[Z]'),
    });

    if (dayjs().isAfter(createdAt.add(expiresIn, 'second'))) {
      this.usersPasswordResetService.setAsExpired(data);
      throw new BadRequestException('Token expirado');
    }

    if (data.is_validated) {
      throw new BadRequestException('Token inválido');
    }

    await this.usersPasswordResetService.setAsValidated(data);

    return {
      success: true,
      status: 'success',
      message: 'Token validated successfully',
    };
  }

  @Public()
  @Post('/:token')
  public async resetPassword(
    @Param('token') token: string,
    @Body(new ZodValidationPipe(resetPasswordFormSchema))
    form: ResetPasswordSchemaDto,
  ) {
    const data = await this.usersPasswordResetService.findOne(token);

    if (!data) {
      throw new NotFoundException('Token não encontrado');
    }

    if (data.is_expired) {
      throw new BadRequestException('Token expirado');
    }

    if (!data.is_validated) {
      await this.usersPasswordResetService.setAsValidated(data);
    }

    const user = await this.userService.findByEmail(data.email);

    if (!user) {
      throw new NotFoundException('Registro não encontrado');
    }

    return this.userService.updatePassword(user.id, form.password);
  }
}
