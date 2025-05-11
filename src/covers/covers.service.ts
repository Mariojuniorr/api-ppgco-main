import { Injectable, NotFoundException } from '@nestjs/common';
import { SystemApliancesService } from 'src/system-apliances';
import { Cover } from './covers.constants';
import { MediaService } from 'src/media';

@Injectable()
export class CoversService {
  constructor(
    private readonly systemApliancesService: SystemApliancesService,
  ) {}

  public async getLoginCover() {
    return this.systemApliancesService.findAplianceValue(Cover.LOGIN);
  }

  public async getPasswordResetCover() {
    return this.systemApliancesService.findAplianceValue(Cover.PASSWORD_RESET);
  }

  public async getRequestPasswordResetCover() {
    return this.systemApliancesService.findAplianceValue(
      Cover.REQUEST_PASSWORD_RESET,
    );
  }

  public async updateCover(
    cover: Cover,
    files: Record<string, Express.Multer.File[]>,
  ) {
    const apliance = await this.systemApliancesService.findApliance(cover);

    if (!apliance) {
      throw new NotFoundException('Appliance not found');
    }

    // const filePath = await apliance
    //   .saveFiles(files)
    //   .then(([uploadedFiles]) => uploadedFiles.getUrl());
    const filePath = ''; // TODO fix this

    return this.systemApliancesService.set(cover, filePath);
  }

  public async updateLoginCover(files: Record<string, Express.Multer.File[]>) {
    return this.updateCover(Cover.LOGIN, files);
  }

  public async updateResetPasswordCover(
    files: Record<string, Express.Multer.File[]>,
  ) {
    return this.updateCover(Cover.PASSWORD_RESET, files);
  }

  public async updateRequestPasswordResetCover(
    files: Record<string, Express.Multer.File[]>,
  ) {
    return this.updateCover(Cover.REQUEST_PASSWORD_RESET, files);
  }
}
