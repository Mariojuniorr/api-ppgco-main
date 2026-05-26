import { Controller, Get, UseGuards } from '@nestjs/common';
import { FaqService } from './faq.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Faq } from './entities/faq.entity';

@ApiTags('faq')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as perguntas frequentes' })
  @ApiResponse({ status: 200, type: [Faq] })
  findAll() {
    return this.faqService.findAll();
  }
}
