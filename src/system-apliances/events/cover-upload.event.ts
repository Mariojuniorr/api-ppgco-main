import { UploadedFile } from 'src/files';
import { SystemApliance } from '../entities';

export class CoverUploadEvent {
  constructor(
    public readonly systemApliance: SystemApliance,
    public readonly coverBuffer: UploadedFile,
  ) {}
}
