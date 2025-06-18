import { Module, OnModuleInit } from '@nestjs/common';
import { SystemApliancesService } from './system-apliances.service';
import { systemApliancesProviders } from './system-apliances.providers';
import { EventManagerService } from 'src/event-manager';
import { SystemApliance } from './entities';
import { MediaModule } from 'src/media';
import { CoverListener } from './listeners';

@Module({
  imports: [MediaModule],
  providers: [
    SystemApliancesService,
    CoverListener,
    ...systemApliancesProviders,
  ],
  exports: [SystemApliancesService],
})
export class SystemApliancesModule implements OnModuleInit {
  constructor(private readonly eventManagerService: EventManagerService) {}

  onModuleInit() {
    SystemApliance.injectDependencies(this.eventManagerService);
  }
}
