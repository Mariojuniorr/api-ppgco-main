import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Dialect } from 'sequelize';
import { DB } from 'src/app.constants';
import { entities } from 'src/app.entities';
import { isProduction } from 'src/utils';
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
import { DefaultMilestonesModule } from 'src/default-milestones/default-milestones.module';
import { NotificationsModule } from 'src/notifications';
import { PublicationCoauthorsModule } from 'src/publication-coauthors';
import { UsersPasswordResetModule } from 'src/users-password-reset';
import { CoversModule } from 'src/covers';
import { PpgcoBucketModule } from 'src/ppgco-bucket';
// import { BucketModule } from 'src/ppgco-bucket/ppgco-bucket.module';
// {MODULE_IMPORT} Don't delete me, I'm used for automatic code generation

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get<Dialect>(DB.CONNECTION),
        host: configService.get<string>(DB.HOST),
        port: configService.get<number>(DB.PORT),
        username: configService.get<string>(DB.USERNAME),
        password: configService.get<string>(DB.PASSWORD),
        database: configService.get<string>(DB.DATABASE),
        autoLoadModels: true,
        synchronize: false,
        ssl: isProduction(),
        models: [...entities.tables, ...entities.views],
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
    }),
    UserModule,
    AuthModule,
    ProjectModule,
    CrudGeneratorModule,
    // PpgcoBucketModule,
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
    // {MODULE} Don't delete me, I'm used for automatic code generation
  ],
  controllers: [AuthController],
  providers: [AuthService, Logger, ...crudGeneratorCommands],
  exports: [AuthService, ...crudGeneratorCommands],
})
export class AppModule {}
