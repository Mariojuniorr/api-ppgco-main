import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createUserSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  birth_date: z.string().optional(),
  email: z.string(),
  password: z.string(),
  phone: z.string().optional(),
  roles: z.array(z.string()),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
