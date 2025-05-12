import { Global, Module } from '@nestjs/common';
import { EventManagerService } from './event-manager.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [EventManagerService],
  exports: [EventManagerService],
})
export class EventManagerModule {}
