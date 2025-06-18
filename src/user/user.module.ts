import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActivationsModule } from 'src/activations/activations.module';
import { UsersPasswordResetModule } from 'src/users-password-reset';
import { MailerModule } from 'src/mailer/mailer.module';
import { UserHasRolesModule } from 'src/user-has-roles';
import { RolesModule } from 'src/roles';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { userProviders } from './user.providers';
import { User } from './entities';
import { FileListener } from './listeners';
import { EventManagerService } from 'src/event-manager';
import { MediaModule } from 'src/media';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    RolesModule,
    MediaModule,
    MailerModule,
    ActivationsModule,
    UserHasRolesModule,
    UsersPasswordResetModule,
  ],
  controllers: [UserController],
  providers: [UserService, FileListener, ...userProviders],
  exports: [UserService],
})
export class UserModule implements OnModuleInit {
  constructor(private readonly eventManagerService: EventManagerService) {}

  onModuleInit() {
    User.injectDependencies(this.eventManagerService);
  }
}
