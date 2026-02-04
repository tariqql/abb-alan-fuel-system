# تصميم نظام عبّ الآن - وثيقة البنية المعمارية

## نظرة عامة على النظام

نظام متكامل لتقسيط وقود السيارات يتكون من ثلاث خدمات مصغرة (Microservices):
1. **خدمة الفوترة (Billing Service)** - إدارة الفواتير والتقسيط
2. **خدمة الرحلات (Journey Service)** - تخطيط المسارات ومحطات الوقود
3. **محرك سنافي AI (Snafi AI Service)** - تحليل استهلاك الوقود بالذكاء الاصطناعي

---

## تصميم قاعدة البيانات (Database Schema Design)

### مخطط العلاقات (Entity Relationship Diagram)

```mermaid
erDiagram
    USERS ||--o{ WALLETS : has
    USERS ||--o{ INVOICES : creates
    USERS ||--o{ JOURNEYS : plans
    USERS ||--o{ VEHICLES : owns
    VEHICLES ||--o{ TANK_MEASUREMENTS : has
    VEHICLES ||--o{ INVOICES : for
    INVOICES ||--o{ PAYMENTS : receives
    INVOICES }o--|| FUEL_STATIONS : at
    JOURNEYS }o--o{ FUEL_STATIONS : includes
    TANK_MEASUREMENTS ||--o{ AI_PREDICTIONS : generates
    WALLETS ||--o{ TRANSACTIONS : contains
    SNAFI_APPROVALS ||--|| INVOICES : approves

    USERS {
        uuid id PK
        string name
        string email UK
        string phone UK
        string national_id UK
        string password_hash
        enum status
        decimal credit_limit
        decimal credit_score
        timestamp created_at
        timestamp updated_at
    }

    WALLETS {
        uuid id PK
        uuid user_id FK
        decimal balance
        decimal available_credit
        decimal used_credit
        enum currency
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid wallet_id FK
        enum type
        decimal amount
        string description
        uuid reference_id
        enum status
        timestamp created_at
    }

    VEHICLES {
        uuid id PK
        uuid user_id FK
        string plate_number UK
        string make
        string model
        int year
        decimal tank_capacity
        decimal avg_consumption
        enum fuel_type
        boolean is_primary
        timestamp created_at
    }

    INVOICES {
        uuid id PK
        uuid user_id FK
        uuid vehicle_id FK
        uuid station_id FK
        uuid snafi_approval_id FK
        enum fuel_type
        decimal liters
        decimal price_per_liter
        decimal total_amount
        int total_installments
        int paid_installments
        decimal monthly_amount
        date due_date
        enum status
        timestamp created_at
        timestamp updated_at
    }

    PAYMENTS {
        uuid id PK
        uuid invoice_id FK
        uuid wallet_id FK
        int installment_number
        decimal amount
        enum payment_method
        enum status
        string transaction_ref
        timestamp paid_at
        timestamp created_at
    }

    FUEL_STATIONS {
        uuid id PK
        string name
        string location
        decimal lat
        decimal lng
        string city
        string region
        json fuel_types
        json prices
        json amenities
        decimal rating
        boolean is_active
        timestamp created_at
    }

    JOURNEYS {
        uuid id PK
        uuid user_id FK
        string name
        string start_location
        string end_location
        decimal distance_km
        decimal estimated_fuel
        decimal estimated_cost
        json waypoints
        json selected_stations
        enum status
        timestamp planned_date
        timestamp created_at
    }

    TANK_MEASUREMENTS {
        uuid id PK
        uuid vehicle_id FK
        decimal tank_capacity
        decimal current_level
        decimal fuel_percentage
        decimal avg_consumption
        decimal estimated_range
        string recommendation
        json sensor_data
        timestamp measured_at
        timestamp created_at
    }

    AI_PREDICTIONS {
        uuid id PK
        uuid measurement_id FK
        uuid vehicle_id FK
        decimal predicted_consumption
        decimal predicted_range
        decimal confidence_score
        json factors
        string analysis
        timestamp valid_until
        timestamp created_at
    }

    SNAFI_APPROVALS {
        uuid id PK
        uuid user_id FK
        uuid vehicle_id FK
        decimal requested_amount
        decimal approved_amount
        decimal risk_score
        enum decision
        string reason
        json ai_analysis
        timestamp expires_at
        timestamp created_at
    }
```

---

### تفاصيل الجداول

#### 1. جدول المستخدمين (USERS)

| العمود | النوع | الوصف |
|--------|------|-------|
| id | UUID | المعرف الفريد |
| name | VARCHAR(100) | الاسم الكامل |
| email | VARCHAR(255) | البريد الإلكتروني (فريد) |
| phone | VARCHAR(20) | رقم الجوال (فريد) |
| national_id | VARCHAR(20) | رقم الهوية الوطنية |
| password_hash | VARCHAR(255) | كلمة المرور المشفرة |
| status | ENUM | (active, suspended, pending) |
| credit_limit | DECIMAL(10,2) | الحد الائتماني |
| credit_score | DECIMAL(5,2) | درجة الائتمان (0-100) |
| created_at | TIMESTAMP | تاريخ الإنشاء |
| updated_at | TIMESTAMP | تاريخ التحديث |

#### 2. جدول المحفظة (WALLETS)

| العمود | النوع | الوصف |
|--------|------|-------|
| id | UUID | المعرف الفريد |
| user_id | UUID | معرف المستخدم |
| balance | DECIMAL(12,2) | الرصيد الحالي |
| available_credit | DECIMAL(12,2) | الائتمان المتاح |
| used_credit | DECIMAL(12,2) | الائتمان المستخدم |
| currency | ENUM | (SAR, USD) |
| is_active | BOOLEAN | حالة المحفظة |

#### 3. جدول الفواتير (INVOICES)

| العمود | النوع | الوصف |
|--------|------|-------|
| id | UUID | المعرف الفريد |
| user_id | UUID | معرف المستخدم |
| vehicle_id | UUID | معرف المركبة |
| station_id | UUID | معرف المحطة |
| snafi_approval_id | UUID | معرف موافقة سنافي |
| fuel_type | ENUM | (91, 95, diesel) |
| liters | DECIMAL(8,2) | كمية اللترات |
| price_per_liter | DECIMAL(6,2) | سعر اللتر |
| total_amount | DECIMAL(10,2) | المبلغ الإجمالي |
| total_installments | INTEGER | عدد الأقساط |
| paid_installments | INTEGER | الأقساط المسددة |
| monthly_amount | DECIMAL(10,2) | القسط الشهري |
| status | ENUM | (pending, active, completed, overdue) |

#### 4. جدول موافقات سنافي (SNAFI_APPROVALS)

| العمود | النوع | الوصف |
|--------|------|-------|
| id | UUID | المعرف الفريد |
| user_id | UUID | معرف المستخدم |
| vehicle_id | UUID | معرف المركبة |
| requested_amount | DECIMAL(10,2) | المبلغ المطلوب |
| approved_amount | DECIMAL(10,2) | المبلغ الموافق عليه |
| risk_score | DECIMAL(5,2) | درجة المخاطرة |
| decision | ENUM | (approved, rejected, pending) |
| reason | TEXT | سبب القرار |
| ai_analysis | JSON | تحليل الذكاء الاصطناعي |

---

## مخططات تسلسل العمليات (Sequence Diagrams)

### 1. رحلة طلب تعبئة الوقود وإصدار فاتورة التقسيط

```mermaid
sequenceDiagram
    autonumber
    participant C as العميل
    participant APP as تطبيق عبّ الآن
    participant BS as خدمة الفوترة
    participant SNAFI as محرك سنافي AI
    participant W as المحفظة
    participant S as محطة الوقود
    participant DB as قاعدة البيانات

    Note over C,DB: مرحلة طلب التعبئة

    C->>APP: فتح التطبيق
    APP->>DB: جلب بيانات المستخدم والمركبة
    DB-->>APP: بيانات المستخدم
    APP-->>C: عرض الصفحة الرئيسية

    C->>APP: طلب تعبئة وقود (50 لتر، بنزين 95)
    APP->>SNAFI: طلب تقييم الائتمان
    
    Note over SNAFI: تحليل الذكاء الاصطناعي

    SNAFI->>DB: جلب سجل المستخدم والمدفوعات
    DB-->>SNAFI: البيانات التاريخية
    SNAFI->>SNAFI: حساب درجة المخاطرة
    SNAFI->>SNAFI: تحليل نمط الاستهلاك
    SNAFI->>SNAFI: التحقق من الحد الائتماني
    
    alt الموافقة على الطلب
        SNAFI-->>APP: موافقة (risk_score < 30%)
        APP->>DB: حفظ موافقة سنافي
        
        Note over C,DB: مرحلة إنشاء الفاتورة

        APP->>BS: إنشاء فاتورة تقسيط
        BS->>DB: حفظ الفاتورة
        BS->>W: خصم من الائتمان المتاح
        W->>DB: تحديث المحفظة
        BS-->>APP: تأكيد إنشاء الفاتورة
        
        APP->>S: إرسال كود التعبئة
        APP-->>C: عرض كود التعبئة وتفاصيل الفاتورة
        
        C->>S: التوجه للمحطة وعرض الكود
        S->>APP: تأكيد استلام الوقود
        APP->>DB: تحديث حالة الفاتورة إلى "نشطة"
        APP-->>C: إشعار نجاح العملية
        
    else رفض الطلب
        SNAFI-->>APP: رفض (risk_score >= 30%)
        APP-->>C: عرض سبب الرفض واقتراحات
    end
```

### 2. رحلة سداد القسط الشهري

```mermaid
sequenceDiagram
    autonumber
    participant C as العميل
    participant APP as تطبيق عبّ الآن
    participant BS as خدمة الفوترة
    participant W as المحفظة
    participant PG as بوابة الدفع
    participant DB as قاعدة البيانات
    participant N as خدمة الإشعارات

    Note over C,N: إشعار موعد السداد

    N->>C: إشعار: موعد سداد القسط (قبل 3 أيام)
    C->>APP: فتح صفحة الفواتير
    APP->>BS: جلب الفواتير النشطة
    BS->>DB: استعلام الفواتير
    DB-->>BS: قائمة الفواتير
    BS-->>APP: عرض الفواتير

    C->>APP: اختيار فاتورة للسداد
    APP-->>C: عرض تفاصيل القسط

    C->>APP: تأكيد السداد
    APP->>PG: طلب الدفع
    
    alt نجاح الدفع
        PG-->>APP: تأكيد الدفع (transaction_ref)
        APP->>BS: تسجيل السداد
        BS->>DB: إنشاء سجل الدفع
        BS->>W: تحديث الائتمان المتاح
        W->>DB: تحديث المحفظة
        BS->>DB: تحديث الفاتورة (paid_installments++)
        
        alt جميع الأقساط مسددة
            BS->>DB: تحديث حالة الفاتورة إلى "مكتملة"
            N->>C: إشعار: تم إغلاق الفاتورة بنجاح
        else أقساط متبقية
            N->>C: إشعار: تم السداد، الأقساط المتبقية X
        end
        
        APP-->>C: عرض إيصال الدفع
        
    else فشل الدفع
        PG-->>APP: فشل الدفع (السبب)
        APP-->>C: عرض رسالة الخطأ
    end
```

### 3. رحلة تخطيط مسار وحساب الوقود

```mermaid
sequenceDiagram
    autonumber
    participant C as العميل
    participant APP as تطبيق عبّ الآن
    participant JS as خدمة الرحلات
    participant SNAFI as محرك سنافي AI
    participant DB as قاعدة البيانات
    participant MAPS as خدمة الخرائط

    C->>APP: فتح صفحة "صمم رحلتك"
    APP->>JS: جلب الرحلات السابقة
    JS->>DB: استعلام الرحلات
    DB-->>JS: الرحلات المحفوظة
    JS-->>APP: عرض الرحلات

    C->>APP: إنشاء رحلة جديدة
    C->>APP: إدخال نقطة البداية (الرياض)
    C->>APP: إدخال نقطة النهاية (جدة)
    
    APP->>MAPS: حساب المسار والمسافة
    MAPS-->>APP: المسار (950 كم)
    
    APP->>SNAFI: حساب استهلاك الوقود
    SNAFI->>DB: جلب بيانات المركبة
    DB-->>SNAFI: سعة الخزان، متوسط الاستهلاك
    SNAFI->>SNAFI: حساب الوقود المطلوب
    SNAFI-->>APP: الوقود: 76 لتر، التكلفة: 165 ريال
    
    APP->>JS: جلب المحطات على المسار
    JS->>DB: استعلام المحطات
    DB-->>JS: قائمة المحطات
    JS-->>APP: المحطات المتاحة
    
    APP-->>C: عرض الخريطة والمحطات والتكلفة
    
    C->>APP: اختيار محطات التوقف
    C->>APP: حفظ الرحلة
    
    APP->>JS: حفظ خطة الرحلة
    JS->>DB: إنشاء سجل الرحلة
    DB-->>JS: تأكيد الحفظ
    JS-->>APP: الرحلة محفوظة
    APP-->>C: عرض تفاصيل الرحلة المحفوظة
```

### 4. رحلة قياس مستوى الخزان وتحليل سنافي

```mermaid
sequenceDiagram
    autonumber
    participant C as العميل
    participant APP as تطبيق عبّ الآن
    participant SNAFI as محرك سنافي AI
    participant CLAUDE as Claude AI
    participant DB as قاعدة البيانات
    participant N as خدمة الإشعارات

    C->>APP: فتح صفحة "محرك سنافي"
    APP->>SNAFI: جلب آخر القراءات
    SNAFI->>DB: استعلام القراءات
    DB-->>SNAFI: القراءات السابقة
    SNAFI-->>APP: عرض الإحصائيات

    C->>APP: إضافة قراءة جديدة
    C->>APP: إدخال البيانات (الخزان: 60 لتر، الحالي: 25 لتر)
    
    APP->>SNAFI: تسجيل القراءة
    SNAFI->>SNAFI: حساب نسبة الامتلاء (41.7%)
    SNAFI->>SNAFI: حساب المسافة المتوقعة (312 كم)
    
    SNAFI->>CLAUDE: طلب تحليل وتوصية
    Note over CLAUDE: تحليل بالذكاء الاصطناعي
    CLAUDE->>CLAUDE: تحليل نمط الاستهلاك
    CLAUDE->>CLAUDE: مقارنة بالقراءات السابقة
    CLAUDE->>CLAUDE: توليد توصية مخصصة
    CLAUDE-->>SNAFI: التوصية: "مستوى الوقود معتدل..."
    
    SNAFI->>DB: حفظ القراءة والتوصية
    SNAFI-->>APP: القراءة والتوصية
    APP-->>C: عرض التحليل والتوصية
    
    alt مستوى الوقود منخفض (<20%)
        SNAFI->>SNAFI: إنشاء تنبؤ عاجل
        SNAFI->>DB: حفظ التنبؤ
        N->>C: تنبيه: مستوى الوقود منخفض!
    end
```

---

## بنية الخدمات المصغرة (Microservices Architecture)

```mermaid
flowchart TB
    subgraph CLIENT["العميل"]
        WEB[تطبيق الويب]
        MOBILE[تطبيق الجوال]
    end

    subgraph GATEWAY["بوابة API"]
        AG[API Gateway]
        AUTH[المصادقة JWT]
    end

    subgraph SERVICES["الخدمات المصغرة"]
        BS[خدمة الفوترة<br/>:3001]
        JS[خدمة الرحلات<br/>:3002]
        SNAFI[محرك سنافي<br/>:3003]
    end

    subgraph EXTERNAL["الخدمات الخارجية"]
        CLAUDE[Claude AI]
        PG[بوابة الدفع]
        MAPS[خدمة الخرائط]
    end

    subgraph DATA["طبقة البيانات"]
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis Cache)]
    end

    WEB --> AG
    MOBILE --> AG
    AG --> AUTH
    AUTH --> BS
    AUTH --> JS
    AUTH --> SNAFI
    
    BS --> POSTGRES
    JS --> POSTGRES
    SNAFI --> POSTGRES
    
    BS --> REDIS
    JS --> REDIS
    SNAFI --> REDIS
    
    SNAFI --> CLAUDE
    BS --> PG
    JS --> MAPS
```

---

## نموذج البيانات المشتركة (Shared Data Models)

### حالات الفاتورة (Invoice Status Flow)

```mermaid
stateDiagram-v2
    [*] --> pending: طلب جديد
    pending --> approved: موافقة سنافي
    pending --> rejected: رفض سنافي
    approved --> active: استلام الوقود
    active --> active: سداد جزئي
    active --> completed: سداد كامل
    active --> overdue: تأخر السداد
    overdue --> active: سداد المتأخر
    overdue --> suspended: إيقاف الحساب
    completed --> [*]
    rejected --> [*]
```

### حالات موافقة سنافي (Snafi Approval Flow)

```mermaid
stateDiagram-v2
    [*] --> analyzing: استلام الطلب
    analyzing --> risk_assessment: تحليل البيانات
    risk_assessment --> approved: risk < 30%
    risk_assessment --> review: 30% <= risk < 50%
    risk_assessment --> rejected: risk >= 50%
    review --> approved: مراجعة يدوية
    review --> rejected: رفض المراجعة
    approved --> [*]
    rejected --> [*]
```

---

## ملاحظات التنفيذ

### الأمان
- جميع كلمات المرور مشفرة باستخدام bcrypt
- المصادقة عبر JWT tokens
- تشفير البيانات الحساسة في قاعدة البيانات
- Rate limiting على جميع نقاط API

### الأداء
- استخدام Redis للتخزين المؤقت
- فهرسة الجداول على الحقول المستخدمة بكثرة
- Pagination لجميع القوائم
- Lazy loading للبيانات الثقيلة

### التوسع
- كل خدمة مصغرة مستقلة ويمكن توسيعها أفقياً
- قاعدة بيانات مشتركة مع إمكانية الفصل لاحقاً
- Message Queue للعمليات الطويلة (مستقبلاً)

---

*تم إنشاء هذا التصميم بواسطة Claude AI - نظام عبّ الآن*
*التاريخ: فبراير 2026*
