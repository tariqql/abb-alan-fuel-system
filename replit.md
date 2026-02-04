# عبّ الآن - نظام تقسيط وقود السيارات

## نظرة عامة
نظام متكامل لتقسيط وقود السيارات يتكون من ثلاث خدمات رئيسية:

1. **خدمة تقسيط الفواتير** - إدارة فواتير الوقود وخطط التقسيط
2. **صمم رحلتك** - تخطيط المسارات ومحطات التوقف
3. **محرك سنافي** - ذكاء اصطناعي لقياس وتحليل استهلاك الوقود

## البنية التقنية

### Frontend
- React + TypeScript + Vite
- Tailwind CSS + Shadcn UI
- TanStack Query للتعامل مع البيانات
- Wouter للتوجيه
- دعم كامل للغة العربية (RTL)

### Backend
- Express.js + TypeScript
- PostgreSQL مع Drizzle ORM
- RESTful APIs

### هيكل الملفات
```
client/
  src/
    pages/        # صفحات التطبيق
    components/   # المكونات المشتركة
    hooks/        # Hooks مخصصة
    lib/          # مكتبات مساعدة
server/
  index.ts        # نقطة الدخول
  routes.ts       # مسارات API
  storage.ts      # طبقة التخزين
  db.ts           # اتصال قاعدة البيانات
  seed.ts         # بيانات تجريبية
shared/
  schema.ts       # مخططات قاعدة البيانات
```

## نقاط API

### الفواتير
- `GET /api/invoices` - جلب جميع الفواتير
- `POST /api/invoices` - إنشاء فاتورة جديدة
- `POST /api/invoices/:id/pay` - سداد قسط

### الرحلات
- `GET /api/journeys` - جلب خطط الرحلات
- `POST /api/journeys` - إنشاء رحلة جديدة
- `DELETE /api/journeys/:id` - حذف رحلة

### محطات الوقود
- `GET /api/stations` - جلب المحطات المتاحة

### قياسات الخزان (سنافي)
- `GET /api/tank-measurements` - جلب القراءات
- `POST /api/tank-measurements` - تسجيل قراءة جديدة

### تنبؤات سنافي
- `GET /api/predictions` - جلب التنبؤات

### نظام التحقق من العملاء (Verification & KYC)

#### التحقق من الهوية (نفاذ)
- `POST /api/verification/nafath/initiate` - بدء التحقق من الهوية
- `GET /api/verification/nafath/status/:requestId` - التحقق من حالة الطلب
- `POST /api/verification/nafath/simulate` - محاكاة التحقق (للتطوير)
- `GET /api/verification/age/:userId` - التحقق من العمر

#### فحص الامتثال (KYC/AML)
- `POST /api/verification/compliance/check` - فحص شامل للامتثال
- `GET /api/verification/compliance/:userId` - آخر فحص امتثال

#### السجل الائتماني (سمة)
- `POST /api/verification/credit/report` - جلب التقرير الائتماني
- `POST /api/verification/credit/evaluate` - تقييم أهلية التمويل
- `GET /api/verification/credit/defaults/:userId` - فحص المتعثرات

#### التوظيف (GOSI)
- `POST /api/verification/employment/verify` - التحقق من التوظيف
- `GET /api/verification/employment/priority/:userId` - حساب أولوية العميل

#### تقييم العميل الشامل
- `POST /api/verification/customer/evaluate` - التقييم الشامل
- `GET /api/verification/customer/rating/:userId` - تقييم العميل
- `GET /api/verification/customer/eligibility/:userId` - فحص سريع للأهلية

## خدمات التحقق (Server Services)

```
server/services/
  nafath.service.ts        # التحقق من الهوية عبر نفاذ
  compliance.service.ts    # فحص الامتثال والقضايا
  credit.service.ts        # السجل الائتماني (سمة)
  employment.service.ts    # بيانات التوظيف (GOSI)
  customer-rating.service.ts # التقييم الشامل
  validation.ts            # مخططات التحقق Zod
  index.ts                 # تصدير جميع الخدمات
```

### نظام الأولويات
- **premium**: موظفو الحكومة (أعلى أولوية)
- **high**: موظفو شبه الحكومي
- **medium**: موظفو القطاع الخاص
- **low**: غير موظفين

### درجات الائتمان (سمة)
- 750+ = ممتاز (excellent)
- 650-749 = جيد (good)
- 550-649 = مقبول (fair)
- 500-549 = ضعيف (poor)
- <500 = مرفوض (rejected)

## تشغيل المشروع
```bash
npm run dev     # تشغيل التطوير
npm run db:push # مزامنة قاعدة البيانات
```

## ملاحظات التصميم
- الألوان الأساسية: برتقالي/ذهبي (موضوع الوقود)
- دعم الوضع الليلي والنهاري
- تصميم متجاوب للجوال والشاشات الكبيرة
