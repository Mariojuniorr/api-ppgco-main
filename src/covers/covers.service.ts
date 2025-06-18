import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SystemApliancesService } from 'src/system-apliances';
import { CoverKeys, Covers } from './covers.constants';
import { Dict } from 'src/core';
import { UploadedFile } from 'src/files';
import { StorageService } from 'src/storage';
import _first from 'lodash/first';
import { Media } from 'src/media';

@Injectable()
export class CoversService {
  constructor(
    private readonly systemApliancesService: SystemApliancesService,
    private readonly storageService: StorageService,
  ) {}

  public async getCover(cover: Covers) {
    return this.systemApliancesService.findAplianceValue(cover);
  }

  public async setCover(cover: Covers, files: Dict<Array<UploadedFile>>) {
    const coverKey = CoverKeys[cover.toUpperCase()];
    const apliance = await this.systemApliancesService.findApliance(coverKey);

    if (!apliance) {
      throw new NotFoundException('Appliance not found');
    }

    const collection = _first(files[cover]);

    if (!collection) {
      throw new BadRequestException('Cover not sent');
    }

    return this.systemApliancesService.setFromFile(coverKey, collection);
  }
}
