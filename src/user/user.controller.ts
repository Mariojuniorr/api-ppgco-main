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
  UploadedFiles,
} from '@nestjs/common';
import { Filters, OrderDto, ZodValidationPipe, Public } from 'src/core';
import {
  UploadedMediaValidationPipe,
  UseMediaValidatorInterceptor,
} from 'src/media';
import { Can } from 'src/permissions';
import { randomString } from 'src/utils';
import { UserService } from './user.service';
import { User } from './entities';
import { createUserSchema, CreateUserDto, UpdateUserDto, PaginatedUserDto } from './dto';
import { CurrentUser } from './user.decorator';
import { COLLECTIONS } from './user.constants';
import { Permissions } from './user.enum';
import { DeleteSuccessResponse, UpdateSuccessResponse } from 'src/core/dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users')

@Controller('users')
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Post('upload-file')
  @Can(Permissions.Create)
  @UseMediaValidatorInterceptor(COLLECTIONS)
  @ApiOperation({ summary: 'Upload user file', description: 'Uploads avatar/media file for a user.' })
  @ApiCreatedResponse({ type: User })
  uploadFileAndPassValidation(
    @CurrentUser() user: User,
    @UploadedFiles(UploadedMediaValidationPipe(COLLECTIONS))
    files: Record<string, Express.Multer.File[]>,
  ) {
    if (!files) {
      throw new BadRequestException('No files sent');
    }
    return user.saveFiles(files);
  }

  @Post()
  @Can(Permissions.Create)
  @UseMediaValidatorInterceptor(COLLECTIONS)
  @ApiOperation({ summary: 'Create a new user', description: 'Registers a new system user with roles.' })
  @ApiCreatedResponse({ type: User })
  createUser(
    @Body(new ZodValidationPipe(createUserSchema)) createUserDto: CreateUserDto,
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
  @ApiOperation({ summary: 'List all users', description: 'Retrieves paginated user list.' })
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

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile', description: 'Retrieves the logged-in user profile.' })
  @ApiOkResponse({ type: User })
  public async getProfile(@CurrentUser() { dataValues: user }: User) {
    const lattesUrl = await this.userService.getLattesUrl(user.id);
    const matricula = await this.userService.getMatricula(user.id);
    const { roles, ...userData } = user;

    return {
      ...userData,
      roles: roles?.map(r => r.name) || [],
      lattesUrl,
      matricula,
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update own profile', description: 'Partially updates the logged-in user details.' })
  @ApiOkResponse({ type: UpdateSuccessResponse })
  public updateProfile(@CurrentUser() { dataValues: user }: User, @Body() updateUserDto: UpdateUserDto) {
    // Only allow specific fields to be updated by the user themselves
    const { phone, birth_date, lattesUrl } = updateUserDto;
    
    const updateds = this.userService.update(user.id, {
      phone,
      birth_date,
      lattesUrl,
    });

    return {
      status: 'success',
      message: 'Profile updated successfully',
      updateds,
    };
  }

  @Get(':id')
  @Can(Permissions.Read)
  @ApiOperation({ summary: 'Get user details', description: 'Retrieves a single user.' })
  @ApiOkResponse({ type: User })
  public async findOne(@Param('id') id: string[]) {
    const user = await this.userService.findOneWithoutSensiteData(+id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const avatar = await user.getAvatarUrl();

    return { ...user.toJSON(), avatar };
  }

  @Patch(':id')
  @Can(Permissions.Update)
  @ApiOperation({ summary: 'Update a user', description: 'Partially updates user details.' })
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
  @ApiOperation({ summary: 'Delete a user', description: 'Removes user access from system.' })
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
