import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivationsModule } from 'src/activations/activations.module';
import { UsersPasswordResetModule } from 'src/users-password-reset';
import { UserHasRolesModule } from 'src/user-has-roles';
import { MailerModule } from 'src/mailer/mailer.module';
import { MediaModule } from 'src/media';
import { RolesModule } from 'src/roles';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { userProviders } from './user.providers';
import { User } from './entities';

@Module({
  imports: [
    // forwardRef(() => SequelizeModule.forFeature([User])),
    RolesModule,
    MediaModule,
    MailerModule,
    ActivationsModule,
    UserHasRolesModule,
    UsersPasswordResetModule,
  ],
  controllers: [UserController],
  providers: [UserService, ...userProviders],
  exports: [UserService],
})
export class UserModule {
  constructor(private eventEmitter: EventEmitter2) {}

  onModuleInit() {
    User.injectDependencies(this.eventEmitter);
  }
}
