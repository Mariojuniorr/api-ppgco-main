import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { isValid, toIsoString } from 'src/utils';
import { createZodDto } from 'nestjs-zod';

export const updateMediaSchema = z.object({
  model_type: z.string().max(255),
  model_id: z.number(),
  uuid: z.string().max(36).optional(),
  collection_name: z.string().max(255),
  name: z.string().max(255),
  file_name: z.string().max(255),
  mime_type: z.string().max(255).optional(),
  disk: z.string().max(255),
  conversions_disk: z.string().max(255).optional(),
  size: z.number(),
  manipulations: z.string(),
  custom_properties: z.string(),
  generated_conversions: z.string(),
  responsive_images: z.string(),
  order_column: z.number().optional(),
});

export class UpdateMediaDto extends createZodDto(updateMediaSchema) {}
