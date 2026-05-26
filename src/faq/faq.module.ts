import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Faq } from './entities/faq.entity';
import { UserModule } from '../user';
import { AuthModule } from '../auth';

@Module({
  imports: [
    SequelizeModule.forFeature([Faq]),
    UserModule,
    AuthModule
  ],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}
