import { forwardRef, Module } from '@nestjs/common';
import { UsersPasswordResetService } from './users-password-reset.service';
import { usersPasswordResetProviders } from './users-password-reset.providers';
import { UserModule } from 'src/user';
import { AuthModule } from 'src/auth';

@Module({
  providers: [UsersPasswordResetService, ...usersPasswordResetProviders],
  exports: [UsersPasswordResetService],
})
export class UsersPasswordResetModule {}
