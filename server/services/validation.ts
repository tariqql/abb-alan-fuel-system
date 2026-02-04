/**
 * مخططات التحقق من البيانات
 * Validation Schemas for Verification APIs
 */

import { z } from "zod";

// مخطط التحقق من الهوية الوطنية السعودية
const nationalIdSchema = z.string()
  .min(10, "رقم الهوية يجب أن يكون 10 أرقام")
  .max(10, "رقم الهوية يجب أن يكون 10 أرقام")
  .regex(/^[12]\d{9}$/, "رقم الهوية غير صحيح - يجب أن يبدأ بـ 1 أو 2");

// مخطط معرف المستخدم
const userIdSchema = z.string()
  .uuid("معرف المستخدم غير صحيح");

// بدء التحقق من نفاذ
export const nafathInitiateSchema = z.object({
  userId: userIdSchema,
  nationalId: nationalIdSchema,
});

// محاكاة نفاذ
export const nafathSimulateSchema = z.object({
  requestId: z.string().min(1, "معرف الطلب مطلوب"),
  approved: z.boolean(),
});

// فحص الامتثال
export const complianceCheckSchema = z.object({
  userId: userIdSchema,
  nationalId: nationalIdSchema,
});

// جلب التقرير الائتماني
export const creditReportSchema = z.object({
  userId: userIdSchema,
  nationalId: nationalIdSchema,
});

// تقييم أهلية التمويل
export const creditEvaluateSchema = z.object({
  userId: userIdSchema,
  requestedAmount: z.number().positive().optional().default(1000),
});

// التحقق من التوظيف
export const employmentVerifySchema = z.object({
  userId: userIdSchema,
  nationalId: nationalIdSchema,
});

// التقييم الشامل للعميل
export const customerEvaluateSchema = z.object({
  userId: userIdSchema,
  nationalId: nationalIdSchema,
});

// Types
export type NafathInitiateInput = z.infer<typeof nafathInitiateSchema>;
export type NafathSimulateInput = z.infer<typeof nafathSimulateSchema>;
export type ComplianceCheckInput = z.infer<typeof complianceCheckSchema>;
export type CreditReportInput = z.infer<typeof creditReportSchema>;
export type CreditEvaluateInput = z.infer<typeof creditEvaluateSchema>;
export type EmploymentVerifyInput = z.infer<typeof employmentVerifySchema>;
export type CustomerEvaluateInput = z.infer<typeof customerEvaluateSchema>;
