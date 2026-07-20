# Kurumsal Duyuru ve Etkinlik Yönetim Sistemi

Kurum içi duyuru ve etkinliklerin yönetildiği full-stack bir uygulama: **ASP.NET Core Web API** (backend) + **React** (frontend). Yetkili (Admin) kullanıcılar duyuru ve etkinlik oluşturur, yayınlar, arşivler ve kategorilere ayırır; standart kullanıcılar yayınlanmış içerikleri görüntüler, kendi duyurularını taslak olarak oluşturabilir.

## İçindekiler

- [Teknoloji Yığını](#teknoloji-yığını)
- [Mimari ve Katmanlar](#mimari-ve-katmanlar)
- [Veritabanı Tasarımı](#veritabanı-tasarımı)
- [Kimlik Doğrulama ve Yetkilendirme](#kimlik-doğrulama-ve-yetkilendirme)
- [İçerik Yaşam Döngüsü (ContentStatus)](#i̇çerik-yaşam-döngüsü-contentstatus)
- [API Endpoint'leri](#api-endpointleri)
- [Listeleme, Filtreleme ve Sayfalama](#listeleme-filtreleme-ve-sayfalama)
- [Hata Yönetimi](#hata-yönetimi)
- [Frontend](#frontend)
- [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
- [Proje Yapısı](#proje-yapısı)
- [Yol Haritası](#yol-haritası)

## Teknoloji Yığını

**Backend (.NET 10)**

| Teknoloji | Amaç |
|---|---|
| ASP.NET Core Web API | Controller tabanlı REST API |
| Entity Framework Core 10 + Npgsql | PostgreSQL, code-first, migration |
| JWT Bearer Authentication | Token tabanlı kimlik doğrulama, rol bazlı yetki (Admin/User) |
| FluentValidation | Request DTO doğrulama |
| Serilog | Console + dosya loglama (`Logs/log-*.txt`, 14 gün saklama) |
| Microsoft.AspNetCore.OpenApi + Scalar | OpenAPI dokümanı + `/scalar` arayüzü |
| IExceptionHandler + ProblemDetails | Global hata yönetimi |

**Frontend**

| Teknoloji | Amaç |
|---|---|
| React 19 + TypeScript | SPA |
| Vite 8 | Dev server + build (`/api` istekleri backend'e proxy'lenir) |
| Tailwind CSS v4 | Stil; class tabanlı dark/light tema |
| React Router 7 | Sayfa yönlendirme, korumalı rotalar |
| Axios | HTTP istemci; JWT interceptor + global hata toast'ları |

## Mimari ve Katmanlar

Klasik katmanlı mimari; istek akışı şöyledir:

```
HTTP İsteği
   │
   ▼
Middleware Pipeline                 → Serilog request log → ExceptionHandler → Routing
   │                                  → Authentication (JWT) → Authorization (rol)
   ▼
Model Binding                       → JSON → DTO; DataAnnotations ([Required] vb.)
   │                                  burada otomatik kontrol edilir ([ApiController] → 400)
   ▼
Controller  (Controllers/)          → route, [Authorize] rol kısıtı, claim okuma
   │
   ▼
Service     (Services/)             → FluentValidation (manuel ValidateAsync),
   │                                  iş kuralları, sahiplik/yetki kontrolü
   ▼
AppDbContext (Data/)                → EF Core, LINQ → SQL
   │
   ▼
PostgreSQL
```

> Not: FluentValidation bu projede otomatik pipeline'a bağlanmamıştır; servis metotları içinde bilinçli olarak manuel çağrılır. Böylece validasyon, servisi hangi katman çağırırsa çağırsın garanti edilir. DTO'lardaki DataAnnotations attribute'ları ise model binding aşamasında, controller'dan önce çalışır.

Katmanların sorumlulukları:

- **Controllers/**: İnce tutulur. Route tanımı, `[Authorize(Roles = "Admin")]` gibi rol kısıtları, token'dan `userId`/`IsAdmin` çıkarımı yapar ve işi servise devreder. İş kuralı içermez.
- **Services/** + **Services/Interfaces/**: Tüm iş mantığı burada. Her servis interface'i üzerinden DI ile `Scoped` olarak kayıtlıdır (`ICategoryService`, `IAnnouncementService`, `IEventService`, `IUserService`, `IAuthService`, `TokenService`). Validasyon, benzersizlik kontrolü, sahiplik kontrolü (örn. admin olmayan kullanıcı yalnızca kendi duyurusunu düzenleyebilir) ve durum geçişleri burada uygulanır.
- **Dtos/**: Her entity için ayrı `CreateRequest`, `UpdateRequest`, `Response`, `ListRequest` sınıfları. Entity'ler asla dışarı sızmaz; API sözleşmesi DTO'lardır. `Dtos/Common/PagedResponse<T>` sayfalı liste yanıtlarının zarfıdır.
- **Validators/**: FluentValidation kuralları (`RuleFor` ile min/max uzunluk, zorunluluk, tarih tutarlılığı vb.). `AddValidatorsFromAssemblyContaining<Program>()` ile otomatik keşfedilir, servisler içinde manuel `ValidateAsync` çağrılır; başarısızsa `ValidationException` fırlatılır.
- **Entitys/** + **Entitys/Enums/**: Domain modelleri (`User`, `Category`, `Event`, `Announcement`) ve enum'lar (`UserType`, `CategoryType`, `ContentStatus`).
- **Data/**: `AppDbContext`, Fluent API konfigürasyonları (`Data/Configurations/`) ve açılışta admin kullanıcıyı oluşturan `SeedData`.
- **Handlers/**: `GlobalExceptionHandler` — fırlatılan özel exception'ları HTTP durum koduna çevirir (aşağıda tablo var).
- **Excepitons/**: `AppException` tabanlı hiyerarşi: `NotFoundException`, `ValidationException`, `UnauthorizedException`, `ForbiddenException`, `ConflictException`.
- **Helpers/**: `BearerSecuritySchemeTransformer` — OpenAPI dokümanına Bearer güvenlik şeması ekler (Scalar'da token yapıştırma alanı bununla çıkar).
- **Migrations/**: EF Core migration geçmişi.

## Veritabanı Tasarımı

PostgreSQL, code-first. Tüm PK'lar uygulama tarafında üretilen `Guid`'dir (`DatabaseGenerated(None)`).

### Tablolar

**Users**

| Kolon | Tip | Not |
|---|---|---|
| Id | uuid | PK |
| Type | text | `UserType` enum: Unknown / Admin / User (string olarak saklanır) |
| Username | text | zorunlu |
| PasswordHash | text | `IPasswordHasher<User>` (ASP.NET Identity hasher) ile üretilir |
| Email | varchar(256) | zorunlu, **unique index** |
| FirstName / LastName | varchar | zorunlu |
| PhoneNumber | varchar(20) | opsiyonel |
| IsActive | bool | admin deaktif/aktif edebilir |
| IsDeleted | bool | soft delete |
| CreatedAt / UpdatedAt | timestamptz | UTC |

**Categories**

| Kolon | Tip | Not |
|---|---|---|
| Id | uuid | PK |
| Name | varchar(20) | **unique index** |
| Type | varchar(20) | `CategoryType` enum: Undefined / Draft / Published / Unpublished / Archived |
| IsActive | bool | |
| IsDeleted | bool | soft delete |
| CreatedAt / UpdatedAt | timestamptz | |

**Event**

| Kolon | Tip | Not |
|---|---|---|
| Id | uuid | PK |
| Name | varchar(100) | zorunlu |
| Description / Location | varchar(100) | |
| StartDate / EndDate | timestamptz | |
| CategoryId | uuid | FK → Categories, `Restrict` |
| CreatedByUserId | uuid | FK → Users, `Restrict` |
| Status | varchar(20) | `ContentStatus` enum |
| CreatedAt / UpdatedAt | timestamptz | |

**Announcement**

| Kolon | Tip | Not |
|---|---|---|
| Id | uuid | PK |
| Title | varchar(100) | zorunlu |
| Content | varchar(500) | |
| CreatedByUserId | uuid | FK → Users, `Restrict` |
| CategoryId | uuid | FK → Categories, `Restrict` |
| status | varchar(20) | `ContentStatus` enum |
| created_at / updated_at | timestamptz | |

### İlişkiler

```
Users 1 ──── * Announcement    (CreatedByUserId, Restrict)
Users 1 ──── * Event           (CreatedByUserId, Restrict)
Categories 1 ── * Event        (CategoryId, Restrict)
Categories 1 ── * Announcement (CategoryId, Restrict)
```

`DeleteBehavior.Restrict`: ilişkili kaydı olan kategori/kullanıcı fiziksel silinemez — zaten silme işlemleri soft delete'tir.

### Index'ler

- `Users.Email` — unique
- `Categories.Name` — unique
- `Event.StartDate`, `Event(CategoryId, Status)` — listeleme/filtreleme performansı
- `Announcement(CategoryId, Status)` — listeleme/filtreleme performansı

### Global Query Filter'lar

EF sorgu seviyesinde otomatik uygulanır:

- `User`, `Category`: `IsDeleted == false` olanlar gelir (soft delete gizleme)
- `Event`, `Announcement`: `Status != Archived` olanlar gelir (arşiv gizleme)

### Diğer Tasarım Kararları

- **UTC converter**: `AppDbContext.OnModelCreating` içinde tüm `DateTime` property'lerine value converter uygulanır — yazarken `ToUniversalTime()`, okurken `Kind = Utc`. Zaman dilimi kaynaklı hatalar kökten engellenir.
- **Enum'lar string saklanır** (`HasConversion<string>` + JSON'da `JsonStringEnumConverter`) — DB'de ve API'de okunabilirlik.

## Kimlik Doğrulama ve Yetkilendirme

- `POST /api/Auth/register` ile kayıt (yeni kullanıcı `User` rolündedir), `POST /api/Auth/login` ile giriş. İkisi de JWT döner.
- **JWT claim'leri**: `sub` (userId), `email`, `role` (Admin/User), `jti`. Süre `appsettings` → `Jwt:ExpiresMinutes` (varsayılan 60 dk). `ClockSkew = 0`.
- Şifreler `PasswordHasher<User>` ile hash'lenir; düz metin asla saklanmaz.
- **Seed admin**: Uygulama açılışında hiç Admin yoksa `SeedAdmin:Email` / `SeedAdmin:Password` konfigürasyonundan bir admin oluşturulur (varsayılan: `admin@example.com` / `Admin123!`).
- Yetki iki katmanda uygulanır:
  1. Controller'da `[Authorize]` / `[Authorize(Roles = "Admin")]`
  2. Service'te sahiplik kuralları — örn. duyuru güncellemede admin değilsen ve duyurunun sahibi değilsen `ForbiddenException` (403).
- Frontend de aynı kuralları arayüze yansıtır (admin olmayan kullanıcı yetkisi olmayan butonları hiç görmez), ancak asıl güvenlik her zaman backend'dedir.

## İçerik Yaşam Döngüsü (ContentStatus)

Duyuru ve etkinlikler `ContentStatus` enum'u ile yönetilir:

```
Draft ──publish──▶ Published ──unpublish──▶ Passive ──publish──▶ Published ...
  │                    │                       │
  └────────────────────┴──── archive ──────────┘
                         ▼
                      Archived  (global filter ile listelerden gizlenir)
```

- Yeni içerik `Draft` başlar.
- Standart kullanıcılar yalnızca `Published` içerikleri görür; admin tüm durumları görebilir.
- `Archived` silme gibi davranır; global query filter sayesinde hiçbir listede görünmez.

## API Endpoint'leri

Tüm endpoint'ler `[Authorize]` gerektirir (Auth hariç). "Admin" yazan satırlar `[Authorize(Roles = "Admin")]`.

### Auth — `/api/Auth`

| Metot | Route | Yetki | Açıklama |
|---|---|---|---|
| POST | `/register` | Herkes | Kayıt olur, JWT döner |
| POST | `/login` | Herkes | Giriş yapar, JWT döner |

### Users — `/api/Users`

| Metot | Route | Yetki | Açıklama |
|---|---|---|---|
| GET | `/` | Admin | Tüm kullanıcılar (IsActive dahil) |
| GET | `/me` | Giriş yapmış | Kendi profili |
| GET | `/{id}` | Admin | Tek kullanıcı |
| PUT | `/{id}` | Kendisi/Admin (service'te) | Ad-soyad güncelleme |
| PATCH | `/{id}/deactivate` | Admin | Kullanıcıyı pasife alır |
| PATCH | `/{id}/activate` | Admin | Kullanıcıyı aktife alır |
| DELETE | `/{id}` | Admin | Soft delete |

### Category — `/api/Category`

| Metot | Route | Yetki | Açıklama |
|---|---|---|---|
| POST | `/` | Admin | Kategori oluşturur (isim unique) |
| GET | `/?includeUnactivated=` | Giriş yapmış | Liste; pasifler yalnızca admin isteğinde gelir |
| GET | `/{id}` | Giriş yapmış | Tek kategori |
| PUT | `/` | Admin | Güncelleme (`IsActive` dahil — aktifleştirme bununla yapılır) |
| PATCH | `/{id}/deactivate` | Admin | Pasife alır |
| DELETE | `/?categoryId=` | Admin | Soft delete |

### Event — `/api/Event`

| Metot | Route | Yetki | Açıklama |
|---|---|---|---|
| POST | `/` | Admin | Etkinlik oluşturur (`Draft`) |
| GET | `/` | Giriş yapmış | Sayfalı liste (aşağıdaki filtreler) |
| GET | `/{eventId}` | Giriş yapmış | Tek etkinlik |
| PUT | `/{eventId}` | Admin | Güncelleme |
| PATCH | `/{eventId}/publish` | Admin | Yayınlar |
| PATCH | `/{eventId}/unpublish` | Admin | Yayından kaldırır (`Passive`) |
| PATCH | `/{eventId}/archive` | Admin | Arşivler |

### Announcement — `/api/Announcement`

| Metot | Route | Yetki | Açıklama |
|---|---|---|---|
| POST | `/` | Giriş yapmış | Duyuru oluşturur (`Draft`); normal kullanıcının duyurusunu admin yayınlar |
| GET | `/` | Giriş yapmış | Sayfalı liste |
| GET | `/{id}` | Giriş yapmış | Tek duyuru |
| PUT | `/{id}` | Sahibi veya Admin (service'te 403) | Güncelleme |
| PATCH | `/{id}/publish` | Admin | Yayınlar |
| PATCH | `/{id}/unpublish` | Admin | Yayından kaldırır |
| PATCH | `/{id}/archive` | Admin | Arşivler |

API dokümantasyonu çalışırken: Scalar arayüzü `http://localhost:5267/scalar`, ham OpenAPI dokümanı `/openapi/v1.json`. Korumalı endpoint'leri denemek için önce login olup token'ı Scalar'daki Bearer alanına yapıştırın.

## Listeleme, Filtreleme ve Sayfalama

Event ve Announcement listeleri `PagedResponse<T>` döner:

```json
{
  "items": [ ... ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 42,
  "totalPages": 5
}
```

Query parametreleri:

| Parametre | Event | Announcement | Açıklama |
|---|---|---|---|
| `page`, `pageSize` | ✔ | ✔ | Sayfalama (varsayılan 1 / 10) |
| `categoryId` | ✔ | ✔ | Kategori filtresi |
| `status` | ✔ | ✔ | ContentStatus filtresi (admin) |
| `search` | ✔ | ✔ | Anahtar kelime araması |
| `startFrom` / `startTo` | ✔ | – | Etkinlik başlangıç tarihi aralığı |
| `createdFrom` / `createdTo` | – | ✔ | Oluşturulma tarihi aralığı |
| `period` | ✔ | – | `Upcoming` / `Past` |

Örnek: `GET /api/Event?period=Upcoming&categoryId=<guid>&page=1&pageSize=10`

## Hata Yönetimi

Servisler özel exception fırlatır; `GlobalExceptionHandler` bunları RFC 7807 `ProblemDetails` gövdesiyle HTTP koduna çevirir:

| Exception | HTTP |
|---|---|
| `ValidationException` | 400 |
| `UnauthorizedException` | 401 |
| `ForbiddenException` | 403 |
| `NotFoundException` | 404 |
| `ConflictException` | 409 |
| Diğer | 500 (detay loglanır, istemciye sızdırılmaz) |

Frontend, hata gövdesindeki `message` / `errors` / `detail` alanını okuyup toast olarak gösterir.

## Frontend

`frontend/` altında bağımsız bir Vite + React + TypeScript projesidir. Vite dev server `/api` isteklerini `http://localhost:5267`'ye proxy'ler (CORS derdi yoktur).

### Yapı

```
frontend/src/
├── api/            # Axios istemci + endpoint fonksiyonları
│   ├── client.ts   # baseURL, JWT interceptor, 401 → login yönlendirme, global hata toast'u
│   └── auth.ts, users.ts, categories.ts, events.ts, announcements.ts, participants.ts
├── components/
│   ├── Layout.tsx  # Sidebar, tema düğmesi, kullanıcı kartı
│   ├── Toast.tsx   # Kütüphanesiz toast sistemi (toast.success/error/info)
│   └── ui.tsx      # Ortak UI kiti: Badge, StatusBadge, Modal, EmptyState, SVG ikonlar, stil token'ları
├── contexts/
│   ├── AuthContext.tsx   # token + kullanıcı state (localStorage), isAdmin
│   └── ThemeContext.tsx  # dark/light tema (localStorage + sistem tercihi)
├── pages/          # Dashboard, Events, Announcements, Categories, Users, Login, Register
└── types/          # API sözleşmesinin TypeScript karşılıkları
```

### Öne Çıkanlar

- **Dark / Light tema**: Tailwind v4 `@custom-variant dark`; tercih localStorage'da saklanır, ilk açılışta sistem teması kullanılır.
- **Korumalı rotalar**: `ProtectedRoute` (token şart), `AdminRoute` (Admin şart), `GuestRoute` (girişliyse dashboard'a atar).
- **Rol bazlı UI**: Admin olmayan kullanıcı; yönetim butonlarını, "İşlemler" kolonlarını ve yetkisi olmayan aksiyonları hiç görmez. Duyurularda Düzenle butonu yalnızca sahibine veya admin'e görünür (`createdByUserId` karşılaştırması).
- **Durum rozetleri**: İçerikler `ContentStatus`'a göre renkli rozet alır — Yayında (yeşil), Taslak (sarı), Pasif (gri), Arşiv (kırmızı).
- **Toast sistemi**: Başarılı işlemlerde bilgi, tüm API hatalarında backend mesajıyla otomatik hata toast'u.
- **RSVP hazırlığı**: Katılım UI'ı yazılmıştır; backend endpoint'leri eklenene kadar kendini gizler (bkz. `docs/RSVP-API.md`).

## Kurulum ve Çalıştırma

Gereksinimler: .NET 10 SDK, Node.js 20+, PostgreSQL 15+.

**1. Veritabanı**

`appsettings.Development.json` → `ConnectionStrings:DefaultConnection` değerini kendi PostgreSQL bilgilerinle güncelle, sonra:

```bash
dotnet restore
dotnet ef database update
```

**2. Backend**

```bash
dotnet run --launch-profile http     # http://localhost:5267
```

İlk açılışta DB'de hiç admin yoksa `SeedAdmin` konfigürasyonundan bir admin oluşturulur.

| Rol   | Email             | Şifre     |
|-------|-------------------|-----------|
| Admin | admin@example.com | Admin123! |

**3. Frontend**

```bash
cd frontend
npm install
npm run dev                          # http://localhost:3000
```

**Faydalı komutlar**

```bash
dotnet ef migrations add <Ad>                    # yeni migration
dotnet ef migrations list                        # uygulanmamışlar "(Pending)" görünür
dotnet ef migrations has-pending-model-changes   # model ile migration senkron mu?
cd frontend && npm run build                     # prod build (tsc + vite)
cd frontend && npm run lint                      # oxlint
```

## Proje Yapısı

```
.
├── Controllers/          # API controller'ları (Auth, Users, Category, Event, Announcement)
├── Services/             # İş mantığı + Interfaces/
├── Dtos/                 # Request/Response sözleşmeleri (+ Common/PagedResponse)
├── Validators/           # FluentValidation kuralları
├── Entitys/              # Domain modelleri + Enums/
├── Data/                 # AppDbContext, Configurations/ (Fluent API), SeedData
├── Handlers/             # GlobalExceptionHandler
├── Excepitons/           # Özel exception hiyerarşisi
├── Helpers/              # BearerSecuritySchemeTransformer (OpenAPI)
├── Migrations/           # EF Core migration'ları
├── Logs/                 # Serilog dosya çıktıları
├── docs/                 # RSVP-API.md (katılım modülü API sözleşmesi)
├── frontend/             # React SPA
└── Dockerfile
```

## Yol Haritası

- [ ] Etkinliğe katılım (RSVP) backend'i — API sözleşmesi hazır: `docs/RSVP-API.md`
- [ ] Frontend'de sayfalama ve arama arayüzü (backend desteği hazır)
- [ ] Refresh token akışı
- [ ] Unit testler (xUnit — servis iş kuralları)
- [ ] Docker Compose (PostgreSQL + API + frontend)
- [ ] CI (GitHub Actions)
