# CancellationToken Ekleme — Step by Step

> Bu dosya projede CancellationToken'ı nasıl ekleyeceğini adım adım gösterir.
> Hiçbir paket kurmanız gerek yok — .NET'te built-in gelir.

---

## Adım 1: Controller'a Parametre Ekle

**Dosya:** `Controllers/EventController.cs`

```csharp
using System.Threading;  // ← Ekle (opsiyonel, VS otomatik import eder)

[HttpGet]
public async Task<ActionResult<PagedResponse<Response>>> GetAll(
    [FromQuery] ListRequest request,
    CancellationToken ct)    // ← BU SATIRI EKLE (framework doldurur)
{
    var result = await _eventService.GetAllAsync(request, IsAdmin(), ct);
    return Ok(result);
}
```

**İçinde kullan:**
- `[HttpPost]` oluştur
- `[HttpPut]` güncelle
- `[HttpPatch]` yayınla/arşivle
- `[HttpDelete]` sil

Tüm async action'lara `CancellationToken ct` parametresi ekle (son parametre, konvansiyon).

---

## Adım 2: Service Interface'ine Ekle

**Dosya:** `Services/Interfaces/IEventService.cs`

```csharp
public interface IEventService
{
    Task<PagedResponse<Response>> GetAllAsync(
        ListRequest request, 
        bool isAdmin,
        CancellationToken ct = default);  // ← Ekle (default = isteğe bağlı)
    
    Task<Response?> GetByIdAsync(Guid id, CancellationToken ct = default);
    
    Task<Response> CreateAsync(
        CreateRequest request, 
        Guid userId,
        CancellationToken ct = default);
    
    // ... diğer metodlar
}
```

---

## Adım 3: Service Implementation'a Ekle

**Dosya:** `Services/EventService.cs`

```csharp
public async Task<PagedResponse<Response>> GetAllAsync(
    ListRequest request, 
    bool isAdmin,
    CancellationToken ct = default)  // ← Ekle
{
    var page = Math.Max(1, request.Page);
    var pageSize = Math.Clamp(request.PageSize, 1, 100);

    var query = _dbContext.Events.AsNoTracking().AsQueryable();
    
    if (!isAdmin)
        query = query.Where(e => e.Status == ContentStatus.Published);
    // ... diğer filtreler ...

    // BURASI ÖNEMLİ: Token'ı async çağrılara geç
    var totalCount = await query.CountAsync(ct);  // ← Token ekle
    
    var items = await query
        .OrderBy(e => e.StartDate)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(e => new Response { ... })
        .ToListAsync(ct);  // ← Token ekle
    
    return new PagedResponse<Response> { ... };
}

public async Task<Response?> GetByIdAsync(Guid id, CancellationToken ct = default)
{
    var ev = await _dbContext.Events
        .FirstOrDefaultAsync(e => e.Id == id, ct);  // ← Token ekle
    
    return ev is null ? null : Map(ev);
}

public async Task<Response> CreateAsync(
    CreateRequest request, 
    Guid userId,
    CancellationToken ct = default)
{
    var ev = new Event { ... };
    
    await _dbContext.Events.AddAsync(ev, ct);  // ← Token ekle
    await _dbContext.SaveChangesAsync(ct);     // ← Token ekle
    
    _logger.LogInformation("Event created {EventId}", ev.Id);
    return Map(ev);
}
```

---

## Adım 4: EF Core Async Çağrılarını Kontrol Et

Token parametresini **TÜM** async EF Core metodlarına geç:

```csharp
// Geçmen gereken yerler:
await _dbContext.Events.ToListAsync(ct);
await _dbContext.SaveChangesAsync(ct);
await _dbContext.Events.AddAsync(entity, ct);
await _dbContext.Events.FirstOrDefaultAsync(predicate, ct);
await _dbContext.Events.CountAsync(ct);
await _dbContext.Events.AnyAsync(predicate, ct);

// HttpClient da token kabul eder:
await _httpClient.GetAsync(url, ct);
await _httpClient.PostAsJsonAsync(url, data, ct);
```

---

## Checklist — Hangi Dosyalara Ekle?

Controller'lar:
- [ ] `Controllers/EventController.cs`
- [ ] `Controllers/AnnouncementController.cs`
- [ ] `Controllers/UserController.cs`
- [ ] `Controllers/CategoryController.cs`

Service Interface'leri:
- [ ] `Services/Interfaces/IEventService.cs`
- [ ] `Services/Interfaces/IAnnouncementService.cs`
- [ ] `Services/Interfaces/IUserService.cs`
- [ ] `Services/Interfaces/ICategoryService.cs`

Service Implementation'lar:
- [ ] `Services/EventService.cs`
- [ ] `Services/AnnouncementService.cs`
- [ ] `Services/UserService.cs`
- [ ] `Services/CategoryService.cs`

---

## Exception Handling (Bonus)

İsteğe bağlı — istemci bağlantı kapanırsa `OperationCanceledException` fırlar. Controller'da yakalamak istersen:

```csharp
[HttpGet]
public async Task<ActionResult<PagedResponse<Response>>> GetAll(
    [FromQuery] ListRequest request,
    CancellationToken ct)
{
    try
    {
        var result = await _eventService.GetAllAsync(request, IsAdmin(), ct);
        return Ok(result);
    }
    catch (OperationCanceledException)
    {
        // İstemci bağlantı kesti, sessiz kapat
        return StatusCode(499);  // "Client Closed Request"
    }
}
```

Ama genelde global handler'da yakalamak daha temiz (ASP.NET Core zaten LogError yapıyor).

---

## Test Ettikten Sonra

Tüm dosyaları ekledikten sonra çalıştır:

```bash
dotnet build  # Derleme hatası var mı kontrol et
dotnet run    # Backend başla
```

Frontend'den istekleri yap, her şey normal çalışmalı. Token iptal mekanizması arka planda sessizce çalışıyor — görmek için bilinçli olarak istemci bağlantısını kesmelisin (tarayıcı sekmesini kapat, F12 Network'te cancel et vb.).

---

## Son Not

- **Parametre konvansiyonu:** Her async metodun **son parametresi** `CancellationToken ct = default`
- **Token geçme:** Service → EF Core zincirinde hepsine geç
- **Default değeri:** `= default` yaparak isteğe bağlı hâle getir
- **Performans:** Token eklenmesi hiçbir overhead eklemiyor, sadece "iptal edebilirlik" kazandırıyor
