import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Faq } from './entities/faq.entity';

@Injectable()
export class FaqService implements OnModuleInit {
  private readonly logger = new Logger(FaqService.name);

  constructor(
    @InjectModel(Faq)
    private faqModel: typeof Faq,
  ) {}

  async onModuleInit() {
    this.logger.log('Sincronizando tabela FAQ...');

    if (this.faqModel.sequelize) {
      // Cria a tabela caso não exista
      await this.faqModel.sequelize.query(`
        CREATE TABLE IF NOT EXISTS faq (
          id SERIAL PRIMARY KEY,
          categoria VARCHAR(255) NOT NULL,
          pergunta TEXT NOT NULL,
          resposta TEXT NOT NULL
        );
      `);
    }

    // Inserção da Carga Inicial Obrigatória
    const seeds = [
      {
        categoria: 'Geral',
        pergunta: 'O que é o aplicativo PPGCO?',
        resposta: 'O aplicativo PPGCO é uma ferramenta desenvolvida para apoiar a jornada acadêmica dos estudantes do Programa de Pós-Graduação em Ciência da Computação da Universidade Federal de Uberlândia (UFU). Ele centraliza informações sobre disciplinas, publicações, prazos e marcos temporais, facilitando a organização e o acompanhamento das atividades acadêmicas.'
      },
      {
        categoria: 'Geral',
        pergunta: 'Quais são os principais recursos do aplicativo?',
        resposta: 'Os principais recursos incluem o gerenciamento de disciplinas (créditos integralizados e a integralizar), acompanhamento de publicações, visualização de marcos temporais e prazos do programa, recebimento de recados e notificações, além do acesso a uma seção de perguntas frequentes (FAQ) para esclarecimento de dúvidas sobre o regulamento do PPGCO.'
      }
    ];

    for (const seed of seeds) {
      const exists = await this.faqModel.findOne({
        where: { pergunta: seed.pergunta }
      });

      if (!exists) {
        await this.faqModel.create(seed);
        this.logger.log(`Seed inserido: ${seed.pergunta}`);
      }
    }
  }

  findAll() {
    return this.faqModel.findAll();
  }
}
