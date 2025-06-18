import { Controller, Get, Post, UploadedFiles } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Dict, Public } from 'src/core';
import { FileCollectionsInterceptor, UploadedFileCollections } from 'src/files';
import {
  Covers,
  LOGIN_COVER_COLLECTIONS,
  REQUEST_RESET_PASSWORD_COLLECTIONS,
  RESET_PASSWORD_COLLECTIONS,
} from './covers.constants';
import { CoversService } from './covers.service';

@Controller('covers')
export class CoversController {
  constructor(private readonly coversService: CoversService) {}

  @Public()
  @Get('/login')
  @ApiOkResponse({
    description: `This endpoint is used to get login cover image`,
    type: String,
  })
  public getLoginCover() {
    return this.coversService.getCover(Covers.LOGIN);
  }

  @Public()
  @Get('/reset-password')
  @ApiOkResponse({
    description: `This endpoint is used to get reset password cover image`,
    type: String,
  })
  public getResetPasswordCover() {
    return this.coversService.getCover(Covers.RESET_PASSWORD);
  }

  @Public()
  @Get('/forgot-password')
  @ApiOkResponse({
    description: `This endpoint is used to get forgot password cover image`,
    type: String,
  })
  public getForgotPasswordCover() {
    return this.coversService.getCover(Covers.REQUEST_RESET_PASSWORD);
  }

  @Public()
  @Post('/login')
  @ApiOkResponse({
    description: `This endpoint is used to get login cover image`,
    type: String,
  })
  @FileCollectionsInterceptor(LOGIN_COVER_COLLECTIONS)
  public postLoginCover(
    @UploadedFileCollections()
    files: Dict<Array<Express.Multer.File>>,
  ) {
    console.log({ files });
    return this.coversService.setCover(Covers.LOGIN, files);
  }

  @Public()
  @Post('/reset-password')
  @ApiOkResponse({
    description: `This endpoint is used to get reset password cover image`,
    type: String,
  })
  @FileCollectionsInterceptor(RESET_PASSWORD_COLLECTIONS)
  public postResetPasswordCover(
    @UploadedFileCollections()
    files: Dict<Array<Express.Multer.File>>,
  ) {
    return this.coversService.setCover(Covers.RESET_PASSWORD, files);
  }

  @Public()
  @Post('/forgot-password')
  @ApiOkResponse({
    description: `This endpoint is used to get forgot password cover image`,
    type: String,
  })
  @FileCollectionsInterceptor(REQUEST_RESET_PASSWORD_COLLECTIONS)
  public postForgotPasswordCover(
    @UploadedFileCollections()
    files: Dict<Array<Express.Multer.File>>,
  ) {
    return this.coversService.setCover(Covers.REQUEST_RESET_PASSWORD, files);
  }
}
