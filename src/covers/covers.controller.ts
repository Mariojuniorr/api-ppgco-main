import { Controller, Get, Post, UploadedFiles } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  UploadedMediaValidationPipe,
  UseMediaValidatorInterceptor,
} from 'src/media';
import { Public } from 'src/core';
import { CoversService } from './covers.service';
import { CollectionNames, COLLECTIONS } from './covers.constants';

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
    return this.coversService.getLoginCover();
  }

  @Public()
  @Get('/reset-password')
  @ApiOkResponse({
    description: `This endpoint is used to get reset password cover image`,
    type: String,
  })
  public getResetPasswordCover() {
    return this.coversService.getPasswordResetCover();
  }

  @Public()
  @Get('/forgot-password')
  @ApiOkResponse({
    description: `This endpoint is used to get forgot password cover image`,
    type: String,
  })
  public getForgotPasswordCover() {
    return this.coversService.getRequestPasswordResetCover();
  }

  @Post()
  @ApiOkResponse({
    description: `This endpoint is used to get login cover image`,
    type: String,
  })
  @UseMediaValidatorInterceptor(COLLECTIONS)
  public async setCovers(
    @UploadedFiles(UploadedMediaValidationPipe(COLLECTIONS))
    files: Record<CollectionNames, Express.Multer.File[]>,
  ) {
    if (files.login_cover) {
      await this.coversService.updateLoginCover({
        login_cover: files.login_cover,
      });
    }
    if (files.password_reset_cover) {
      await this.coversService.updateResetPasswordCover({
        password_reset_cover: files.password_reset_cover,
      });
    }
    if (files.request_password_reset_cover) {
      await this.coversService.updateRequestPasswordResetCover({
        request_password_reset_cover: files.request_password_reset_cover,
      });
    }

    return {
      message: 'Files uploaded successfully',
    };
  }

  @Post('/login')
  @ApiOkResponse({
    description: `This endpoint is used to get login cover image`,
    type: String,
  })
  @UseMediaValidatorInterceptor(COLLECTIONS) // TODO apply pick to only get the correct collection
  public postLoginCover(
    @UploadedFiles(UploadedMediaValidationPipe(COLLECTIONS))
    files: Record<string, Express.Multer.File[]>,
  ) {
    console.log({ files });
    return this.coversService.updateLoginCover(files);
  }

  @Post('/password-reset')
  @ApiOkResponse({
    description: `This endpoint is used to get reset password cover image`,
    type: String,
  })
  @UseMediaValidatorInterceptor(COLLECTIONS) // TODO apply pick to only get the correct collection
  public postResetPasswordCover(
    @UploadedFiles(UploadedMediaValidationPipe(COLLECTIONS))
    files: Record<string, Express.Multer.File[]>,
  ) {
    return this.coversService.updateResetPasswordCover(files);
  }

  @Post('/request-password-reset')
  @ApiOkResponse({
    description: `This endpoint is used to get forgot password cover image`,
    type: String,
  })
  @UseMediaValidatorInterceptor(COLLECTIONS) // TODO apply pick to only get the correct collection
  public postRequestPasswordResetCover(
    @UploadedFiles(UploadedMediaValidationPipe(COLLECTIONS))
    files: Record<string, Express.Multer.File[]>,
  ) {
    return this.coversService.updateRequestPasswordResetCover(files);
  }
}
