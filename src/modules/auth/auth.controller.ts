import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { login, register } from './auth.service';

const LoginSchema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

const RegisterSchema = z.object({
  name:     z.string().min(1, 'Nome obrigatório'),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = LoginSchema.parse(request.body);
  return reply.send(await login(email, password));
}

export async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
  const { name, email, password } = RegisterSchema.parse(request.body);
  return reply.status(201).send(await register(name, email, password));
}
