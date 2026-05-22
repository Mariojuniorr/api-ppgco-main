import { z } from 'zod';
import { isValid, toIsoString } from 'src/utils';
import { createMilestoneDocumentSchema } from 'src/milestone-document';
import { customCreateZodDto } from 'src/core';

// 1. Isolamos o schema original em uma constante base
const baseMilestoneSchema = z.object({
  project_ids: z.array(z.number()),
  description: z.string().max(1024).optional(),
  expected_date: z
    .custom(isValid.date, 'Data')
    .or(z.literal(''))
    .transform(toIsoString),
  meeting_collegiate: z.string().max(255).optional(),
  process_number_sei: z.string().max(255).optional(),
  need_document: z.boolean().optional(),
  situation_id: z.number(),
  documents: z.array(createMilestoneDocumentSchema.optional()),
});

// 2. Exportamos o schema principal usando o preprocess para limpar os dados fantasmas
export const createMilestoneSchema = z.preprocess((val: any) => {
  // Se o objeto existe, mas a flag estiver falsa ou indefinida,
  // nós esvaziamos o array de documentos forçadamente.
  if (val && val.need_document !== true) {
    return {
      ...val,
      documents: [],
    };
  }
  return val; // Caso contrário, segue o jogo normalmente
}, baseMilestoneSchema);

// 3. Passamos o "baseMilestoneSchema" para o DTO do NestJS.
// Fazemos isso porque algumas libs de DTO não suportam ZodEffects (que é o que o preprocess gera).
export class CreateMilestoneDto extends customCreateZodDto(
  baseMilestoneSchema
) { }