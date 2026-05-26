import { ApiProperty } from '@nestjs/swagger';
import { customCreateZodDto } from 'src/core';
import { randomString } from 'src/utils';
import { z } from 'zod';

export const createUserSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  birth_date: z.string().optional(),
  email: z.string(),
  password: z.string(),
  phone: z.string().optional(),
  roles: z.array(z.string()),
  id_pessoa: z.number().optional(),
  cpf: z.string().optional().nullable(),
});

// export type CreateUserDto = z.infer<typeof createUserSchema>;

export class CreateUserDto extends customCreateZodDto(createUserSchema) {}
