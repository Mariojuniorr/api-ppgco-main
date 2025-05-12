import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService, AuthController, AuthModule } from 'src/auth';
import { UserModule } from 'src/user';
import { CrudGeneratorModule, crudGeneratorCommands } from 'src/crud-generator';
import { StudentModule } from 'src/student';
import { MilestoneModule } from 'src/milestone';
import { MilestoneDocumentModule } from 'src/milestone-document';
import { ProjectModule } from 'src/project';
import { AdvisorModule } from 'src/advisor';
import { ResearchLineModule } from 'src/research-line';
import { DisconnectedStudentModule } from 'src/disconnected-student';
import { MilestoneHistoryModule } from 'src/milestone-history';
import { PublicationModule } from 'src/publication';
import { ProjectHasCoadvisorModule } from 'src/project-has-coadvisor';
import { RolesModule } from 'src/roles';
import { UserHasRolesModule } from 'src/user-has-roles';
import { RoleHasPermissionsModule } from 'src/role-has-permissions';
import { PermissionsModule } from 'src/permissions';
import { MediaModule } from 'src/media';
import { MailerModule } from 'src/mailer';
import { ActivationsModule } from 'src/activations';
import { EmailVerificationModule } from 'src/email-verification';
import { CoursesModule } from 'src/courses';
import { SubjectsModule } from 'src/subjects';
import { SystemApliancesModule } from 'src/system-apliances';
import { UserHasPermissionsModule } from 'src/user-has-permissions';
import { DocumentsModule } from 'src/documents';
import { MilestoneSituationModule } from 'src/milestone-situation';
import { DefaultMilestonesModule } from 'src/default-milestones';
import { NotificationsModule } from 'src/notifications';
import { PublicationCoauthorsModule } from 'src/publication-coauthors';
import { UsersPasswordResetModule } from 'src/users-password-reset';
import { CoversModule } from 'src/covers';
import { JwtModule } from 'src/jwt';
import { FilesModule } from 'src/files';
import { EventManagerModule } from 'src/event-manager';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
    AuthModule,
    ProjectModule,
    CrudGeneratorModule,
    PublicationModule,
    StudentModule,
    MilestoneModule,
    MilestoneDocumentModule,
    AdvisorModule,
    ResearchLineModule,
    DisconnectedStudentModule,
    MilestoneHistoryModule,
    ProjectHasCoadvisorModule,
    RolesModule,
    UserHasRolesModule,
    RoleHasPermissionsModule,
    PermissionsModule,
    MediaModule,
    MailerModule,
    ActivationsModule,
    EmailVerificationModule,
    CoursesModule,
    SubjectsModule,
    SystemApliancesModule,
    UserHasPermissionsModule,
    DocumentsModule,
    MilestoneSituationModule,
    DefaultMilestonesModule,
    NotificationsModule,
    PublicationCoauthorsModule,
    UsersPasswordResetModule,
    CoversModule,
    JwtModule,
    FilesModule,
    EventManagerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, Logger, ...crudGeneratorCommands],
  exports: [AuthService, ...crudGeneratorCommands],
})
export class AppModule {}
