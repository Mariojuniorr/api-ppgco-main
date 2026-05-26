import { ApiProperty } from '@nestjs/swagger';
import { customCreateZodDto } from 'src/core';
import { z } from 'zod';

export const updateUserSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  birth_date: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  id_pessoa: z.number().optional(),
  cpf: z.string().optional().nullable(),
  roles: z.array(z.string()).optional(),
  lattesUrl: z.string().optional().nullable(),
});

// export type UpdateUserDto = Partial<z.infer<typeof updateUserSchema>>;

export class UpdateUserDto extends customCreateZodDto(updateUserSchema) {}
