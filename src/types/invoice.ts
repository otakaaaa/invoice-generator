import { z } from 'zod';

export const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, '品目名は必須です'),
  quantity: z.number().positive('数量は1以上を入力してください'),
  unitPrice: z.number().nonnegative('単価は0以上を入力してください'),
  amount: z.number().nonnegative(),
});

export const invoiceSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  
  // 発行元情報
  companyName: z.string().min(1, '会社名は必須です'),
  companyAddress: z.string().min(1, '住所は必須です'),
  companyEmail: z.string().email('正しいメールアドレスを入力してください'),
  
  // 請求先情報
  clientCompanyName: z.string().min(1, '請求先会社名は必須です'),
  clientContactName: z.string().min(1, '担当者名は必須です'),
  clientAddress: z.string().min(1, '請求先住所は必須です'),
  clientEmail: z.string().email('正しいメールアドレスを入力してください'),
  
  // 請求書情報
  invoiceNumber: z.string().min(1, '請求書番号は必須です'),
  issueDate: z.date(),
  dueDate: z.date(),
  
  // 明細
  items: z.array(invoiceItemSchema).min(1, '明細は1件以上必要です'),
  
  // 金額
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
  
  // 備考
  notes: z.string().optional(),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type Invoice = z.infer<typeof invoiceSchema>; 