import { z } from "zod";
import { membershipRoles, ticketCategories, ticketPriorities } from "@/lib/constants";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Informe um e-mail válido" }),
  password: z.string().min(6, { message: "Senha obrigatória" })
});

export const ticketSchema = z.object({
  subject: z.string().min(5, { message: "Assunto obrigatório" }),
  category: z.enum(ticketCategories),
  priority: z.enum(ticketPriorities),
  description: z.string().min(10, { message: "Descreva o chamado" })
});

export const ticketMessageSchema = z.object({
  body: z.string().min(1, { message: "Mensagem obrigatória" })
});

export const contactSchema = z.object({
  name: z.string().min(2, { message: "Nome obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  company: z.string().optional(),
  message: z.string().optional()
});

export const profileSchema = z.object({
  name: z.string().min(2, { message: "Nome obrigatório" })
});

export const organizationSchema = z.object({
  name: z.string().min(2, { message: "Nome obrigatório" }),
  slug: z.string().min(2, { message: "Slug obrigatório" })
});

export const memberSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  role: z.enum(membershipRoles)
});

export const billingUpdateSchema = z.object({
  planId: z.string().min(1)
});

export const announcementSchema = z.object({
  title: z.string().min(3, { message: "Título obrigatório" }),
  content: z.string().min(5, { message: "Conteúdo obrigatório" }),
  publishedAt: z.string().optional(),
  type: z.enum(["notice", "release", "maintenance", "security", "alert"]).optional()
});

export const knowledgeBaseSchema = z.object({
  title: z.string().min(3, { message: "Título obrigatório" }),
  slug: z.string().min(2, { message: "Slug obrigatório" }),
  category: z.string().min(2, { message: "Categoria obrigatória" }),
  content: z.string().min(10, { message: "Conteúdo obrigatório" }),
  publishedAt: z.string().optional()
});
