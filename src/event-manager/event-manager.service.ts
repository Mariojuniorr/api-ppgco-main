import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ListenerFn } from './event-manager.interface';

@Injectable()
export class EventManagerService {
  constructor(private readonly emitter: EventEmitter2) {}

  safeEmit(event: string, payload: any): boolean {
    try {
      return this.emit(event, payload);
    } catch (error) {
      console.error(`Error emitting event ${event}:`, error);
      return false;
    }
  }

  emit(event: string, ...payload: any[]): boolean {
    return this.emitter.emit(event, ...payload);
  }

  emitAsync(event: string, ...payload: any[]): Promise<any[]> {
    return this.emitter.emitAsync(event, ...payload);
  }

  on(event: string, listener: ListenerFn) {
    this.emitter.on(event, listener);
  }

  once(event: string, listener: ListenerFn) {
    this.emitter.once(event, listener);
  }

  off(event: string, listener: ListenerFn) {
    this.emitter.off(event, listener);
  }
}
