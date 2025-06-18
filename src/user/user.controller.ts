import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import {
  Dict,
  Filters,
  OrderDto,
  ZodValidationPipe,
  DeleteSuccessResponse,
  UpdateSuccessResponse,
} from 'src/core';
import { Can } from 'src/permissions';
import { randomString } from 'src/utils';
import { FileCollectionsInterceptor, UploadedFileCollections } from 'src/files';
import _omit from 'lodash/omit';
import { UserService } from './user.service';
import { User } from './entities';
import { createUserSchema, UpdateUserDto, PaginatedUserDto } from './dto';
import { CurrentUser } from './user.decorator';
import { COLLECTIONS } from './user.constants';
import { Permissions } from './user.enum';

@Controller('users')
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Post('upload-file')
  @Can(Permissions.Create)
  @FileCollectionsInterceptor(COLLECTIONS)
  @ApiCreatedResponse({ type: User })
  uploadFileAndPassValidation(
    @CurrentUser() _user: User,
    @UploadedFileCollections() files: Dict<Array<Express.Multer.File>>,
  ) {
    if (!files) {
      throw new BadRequestException('No files sent');
    }

    console.log({ files }); // TODO: fix me
    // return user.saveFiles(files);
  }

  @Post()
  @Can(Permissions.Create)
  @FileCollectionsInterceptor(COLLECTIONS)
  @ApiCreatedResponse({ type: User })
  public async createUser(
    @Body(new ZodValidationPipe(createUserSchema)) createUserDto: any,
    @UploadedFileCollections() files: Dict<Array<Express.Multer.File>>,
  ) {
    const password =
      createUserDto.password === 'generate_default'
        ? randomString(8)
        : createUserDto.password;

    const mailData =
      createUserDto.password === 'generate_default'
        ? `Sua senha é <b>${password}</b>. Altere sua senha no primeiro acesso.<br />`
        : undefined;

    const creationDto = { ...createUserDto, password };
    const user = await this.userService.create(creationDto, {
      files,
      mailData,
    });

    return _omit(user.dataValues, 'avatarBuffer', 'password');
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
    console.log({ id });
    const user = await this.userService.findOneWithoutSensiteData(+id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const avatar = user.avatar?.getUrl();

    return { ...user.dataValues, avatar };
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
}
