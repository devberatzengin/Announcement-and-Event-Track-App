# C# / .NET Temel Kavramlar — Detaylı Notlar

> Bu doküman staj notlarındaki şu başlıkları en ince detayına kadar açıklar:
> CancellationToken, HttpClient, Code First / DB First, Await & Task, `=>` operatörü, Expression.
> Örneklerin çoğu bu projedeki (Announcement & Event Tracker) gerçek kodlarla ilişkilendirilmiştir.

---

## 1. CancellationToken (İptal Jetonu)

### Problem ne?

Bir kullanıcı tarayıcıda "Etkinlikler" sayfasını açtı, API'ye istek gitti, DB'de ağır bir sorgu çalışmaya başladı. Kullanıcı beklemeden sayfayı kapattı. İstemci gitti ama **sunucu hâlâ o sorguyu çalıştırıyor** — kimsenin okumayacağı bir sonuç için CPU ve DB bağlantısı harcanıyor. İşte `CancellationToken`, "bu işin sonucuna artık ihtiyaç yok, bırak" mesajını işin **içine kadar** taşıyan mekanizmadır.

### Üç parça

| Parça | Rolü |
|---|---|
| `CancellationTokenSource` (CTS) | İptali **başlatan** taraf. `cts.Cancel()` çağrılınca token "iptal edildi" durumuna geçer. |
| `CancellationToken` | CTS'in ürettiği, işin içine **parametre olarak taşınan** hafif struct. Kendisi iptal edemez, sadece "iptal edildi mi?" diye bakılır. |
| İşi yapan kod | Token'ı kabul eder ve uygun noktalarda kontrol eder. |

```csharp
var cts = new CancellationTokenSource();
CancellationToken token = cts.Token;

// İşi başlat
var task = UzunIsAsync(token);

// 3 saniye sonra vazgeç
cts.CancelAfter(TimeSpan.FromSeconds(3));   // veya cts.Cancel();
```

### İşin içinde token nasıl kullanılır?

İki yol var:

```csharp
async Task UzunIsAsync(CancellationToken ct)
{
    foreach (var item in liste)
    {
        // 1) Kibarca kontrol: iptal edildiyse OperationCanceledException fırlatır
        ct.ThrowIfCancellationRequested();

        // 2) Token kabul eden API'lere aynen paslamak (asıl kullanım şekli)
        await HttpClientCagrisi(ct);
        await _dbContext.SaveChangesAsync(ct);
    }
}
```

Önemli: iptal **işbirliğine dayalıdır** (cooperative). Token'ı kimse zorla durdurmaz; kod kendisi kontrol etmezse iş sonuna kadar çalışır. Bu bilinçli bir tasarım — thread'i dışarıdan öldürmek (eski `Thread.Abort`) veriyi yarım/bozuk bırakabildiği için terk edildi.

### ASP.NET Core'da bedava geliyor

Controller action'ına parametre olarak eklersen framework onu otomatik bağlar; kullanıcı bağlantıyı kestiğinde (`HttpContext.RequestAborted`) token iptal olur:

```csharp
[HttpGet]
public async Task<ActionResult<PagedResponse<Response>>> GetAll(
    [FromQuery] ListRequest request,
    CancellationToken ct)                       // ← framework doldurur
{
    var result = await _eventService.GetAllAsync(request, IsAdmin(), ct);
    return Ok(result);
}
```

Servis katmanında da EF Core metotlarının hepsi token kabul eder:

```csharp
var items = await query.ToListAsync(ct);       // sorgu DB'de bile iptal edilebilir
await _dbContext.SaveChangesAsync(ct);
```

> Bu projede henüz CancellationToken kullanılmıyor — eklemek güzel bir iyileştirme olur:
> controller'lara `CancellationToken ct` parametresi ekleyip servis → EF zincirinde paslamak yeterli.

### Bilinmesi gereken detaylar

- `OperationCanceledException` fırlar; ASP.NET Core bunu genelde loglayıp bağlantıyı kapatır, 500 saymaz. Global handler'da ayrıca yakalayıp sessiz geçmek isteyebilirsin.
- `CancellationTokenSource.CreateLinkedTokenSource(t1, t2)` — iki token'ı birleştirir: "kullanıcı vazgeçti **veya** 30 sn timeout doldu" gibi.
- `ct.Register(() => ...)` — iptal anında çalışacak callback kaydeder (kaynak temizliği için).
- Token parametresi konvansiyonu: her async metodun **son parametresi**, varsayılanı `default` olur: `Task IsYapAsync(int id, CancellationToken ct = default)`.

---

## 2. HttpClient

### Ne işe yarar?

Kendi uygulamandan **başka bir HTTP servisine** istek atmak için kullanılır. Senin API'n şu an hep "sunucu" tarafında; ama bir gün örneğin bir SMS sağlayıcısına, döviz kuru API'sine veya başka bir mikroservise istek atman gerekirse "istemci" olursun — o zaman `HttpClient` devreye girer. (Frontend'deki axios'un C# karşılığı diyebilirsin.)

```csharp
var client = new HttpClient();
HttpResponseMessage response = await client.GetAsync("https://api.ornek.com/rates");
response.EnsureSuccessStatusCode();                        // 2xx değilse exception
string json = await response.Content.ReadAsStringAsync();

// veya direkt deserialize:
var data = await client.GetFromJsonAsync<KurResponse>("https://api.ornek.com/rates");
await client.PostAsJsonAsync("https://api.ornek.com/orders", yeniSiparis);
```

### Kritik tuzak: her istekte `new HttpClient()` YAPMA

`HttpClient` `IDisposable` diye her istekte `using (var c = new HttpClient())` yazmak çok yaygın bir hatadır. İki ciddi problemi var:

1. **Socket tükenmesi (socket exhaustion)**: Her instance altta bir TCP bağlantı havuzu açar. Dispose etsen bile OS, soketi bir süre `TIME_WAIT` durumunda tutar. Yoğun trafikte binlerce soket birikir ve "address already in use" hatalarıyla uygulama çöker.
2. **Tek statik instance da sorunlu**: Tek `static HttpClient` kullanırsan bu sefer DNS değişikliklerini görmez (bağlantıyı hiç yenilemez).

### Doğru çözüm: IHttpClientFactory

.NET'in resmi cevabı DI üzerinden factory kullanmak — handler havuzunu yönetir, iki sorunu da çözer:

```csharp
// Program.cs
builder.Services.AddHttpClient("sms", c =>
{
    c.BaseAddress = new Uri("https://api.smssaglayici.com/");
    c.Timeout = TimeSpan.FromSeconds(10);
    c.DefaultRequestHeaders.Add("Authorization", "Bearer xxx");
});

// Kullanan sınıfta
public class SmsService
{
    private readonly IHttpClientFactory _factory;
    public SmsService(IHttpClientFactory factory) => _factory = factory;

    public async Task GonderAsync(string tel, string mesaj, CancellationToken ct)
    {
        var client = _factory.CreateClient("sms");     // havuzdan gelir, ucuz
        await client.PostAsJsonAsync("send", new { tel, mesaj }, ct);
    }
}
```

Daha da temizi **typed client**: `AddHttpClient<ISmsService, SmsService>()` — factory'yi hiç görmezsin, ctor'a hazır `HttpClient` gelir.

### Bilinmesi gereken detaylar

- `HttpRequestMessage`/`HttpResponseMessage` ile ham seviyede header, method, content kontrolü yapabilirsin.
- Tüm metotlar `CancellationToken` kabul eder — 1. konuyla birleşir: `GetAsync(url, ct)`.
- Retry/timeout/circuit-breaker gibi dayanıklılık politikaları için `Microsoft.Extensions.Http.Resilience` (veya Polly) factory'ye eklenir: `AddStandardResilienceHandler()`.

---

## 3. Code First vs DB First

İkisi de EF Core'un "model ile veritabanını eşleştirme" yaklaşımı; fark **hangisinin kaynak-of-truth olduğu**.

### Code First (bu projenin yaklaşımı)

Önce C# sınıflarını yazarsın (`Entitys/Event.cs`, `User.cs`...), veritabanı bu sınıflardan **üretilir**:

```
Entity sınıfları + Fluent API konfigürasyonları
        │  dotnet ef migrations add X
        ▼
Migration dosyası (Migrations/..._X.cs)  ← C# kodu olarak "DB'de ne değişecek" tarifi
        │  dotnet ef database update
        ▼
PostgreSQL şeması + __EFMigrationsHistory tablosu
```

- Şemanın tarihçesi migration dosyalarında **kod olarak** durur → git'te versiyonlanır, code review'dan geçer, her ortamda (dev/test/prod) aynı şekilde tekrar oynatılabilir.
- Konfigürasyon iki yerden yapılır: attribute'lar (`[MaxLength(100)]`, `[Table("Event")]`) veya Fluent API (`Data/Configurations/*.cs` — `HasIndex`, `OnDelete`, `HasQueryFilter`...). Bu projede ikisi karışık; genel eğilim Fluent API'de toplamaktır çünkü daha güçlüdür (query filter, composite index vb. attribute ile yapılamaz).
- `__EFMigrationsHistory` tablosu hangi migration'ların uygulandığını tutar — `dotnet ef migrations list`'teki "Pending" bilgisi buradan gelir.

### DB First

Veritabanı zaten vardır (belki 15 yıllık kurumsal bir DB), sınıflar ondan **üretilir** (scaffolding):

```bash
dotnet ef dbcontext scaffold "Host=...;Database=..." Npgsql.EntityFrameworkCore.PostgreSQL -o Models
```

Bu komut tablolara bakıp entity sınıflarını ve DbContext'i otomatik yazar. Şema değişince komutu tekrar çalıştırıp sınıfları yeniden üretirsin. Migration kullanılmaz; şemayı DBA/SQL scriptleri yönetir.

### Hangisi ne zaman?

| Durum | Tercih |
|---|---|
| Sıfırdan proje, şemaya sen karar veriyorsun | **Code First** |
| Var olan/legacy veritabanına bağlanıyorsun | **DB First** |
| Şemayı DBA ekibi SQL ile yönetiyor | DB First |
| Şema tarihçesinin git'te olmasını istiyorsun | Code First |

> Kafanda şöyle kalsın: Code First'te "gerçek" C# kodudur, DB ona uyar. DB First'te "gerçek" veritabanıdır, kod ona uyar.

---

## 4. Task, async ve await

### Task nedir?

`Task`, "devam eden veya bitecek bir iş"i temsil eden nesnedir — JavaScript'teki `Promise`'in C# karşılığı. `Task<T>` ise sonunda `T` tipinde değer üretecek iş.

Kritik ayrım: **Task ≠ Thread.** Bir DB sorgusu beklerken hiçbir thread "bekleyerek" harcanmaz; istek DB'ye gider, thread havuza döner başka isteklere bakar, cevap gelince kaldığı yerden devam edilir. Web sunucusunun az thread'le binlerce isteği kaldırabilmesinin sırrı budur.

### await ne yapar?

```csharp
public async Task<Response?> GetByIdAsync(Guid id)
{
    var ev = await _dbContext.Events.FirstOrDefaultAsync(e => e.Id == id);
    //       ▲ burada metot "duraklar" ama thread bloklanmaz
    return Map(ev);   // cevap gelince buradan devam
}
```

`await` gördüğünde derleyici metodu bir **state machine**'e çevirir: "await'e kadar çalış, işi başlat, metottan çık (thread'i serbest bırak), iş bitince kalan kısmı devam ettir." Yani `await` = "bloklamadan bekle".

Zincir kuralı: `await` kullanan metot `async` işaretlenmeli, `async` metodun dönüş tipi `Task`/`Task<T>` olmalı, onu çağıran da genelde `await` eder. Bu yüzden "async bulaşıcıdır" denir — controller'dan EF'e kadar tüm zincirin async olması normaldir (senin projen böyle, doğru).

### Sık yapılan hatalar

```csharp
// 1) .Result / .Wait() — ASLA
var data = SomeAsync().Result;      // thread'i bloklar, deadlock riski, async'in tüm faydasını öldürür

// 2) async void — event handler dışında ASLA
public async void Kaydet() { ... }  // exception'ı yakalayamazsın, await edilemez
public async Task Kaydet() { ... }  // doğrusu

// 3) await'i unutmak
_dbContext.SaveChangesAsync();      // fire-and-forget: hata yutulur, iş yarım kalabilir (derleyici uyarır)
await _dbContext.SaveChangesAsync();

// 4) Bağımsız işleri sırayla beklemek
var a = await GetEventsAsync();     // 200ms
var b = await GetUsersAsync();      // +200ms → toplam 400ms

var ta = GetEventsAsync();          // ikisini başlat
var tb = GetUsersAsync();
await Task.WhenAll(ta, tb);         // paralel bekle → ~200ms
```

(4. maddeyi frontend'de zaten kullanıyoruz: Events sayfası katılımcı özetlerini `Promise.all` ile çekiyor — `Task.WhenAll`'un JS karşılığı.)

### Bilinmesi gereken detaylar

- `Task.CompletedTask` / `Task.FromResult(x)`: senkron sonucu Task olarak dönmek için.
- `ValueTask<T>`: çoğu zaman senkron biten yollarda allocation tasarrufu; ihtiyaç görmeden kullanma.
- ASP.NET Core'da `SynchronizationContext` yoktur → `ConfigureAwait(false)` API projelerinde şart değil (kütüphane yazarken önerilir).
- Exception'lar Task'ta taşınır ve `await` anında fırlar — `try/catch` await'in etrafına yazılır.

---

## 5. `=>` Operatörü (Lambda ve Expression-Bodied)

Aynı sembol, iki farklı yerde iki farklı anlam taşır:

### a) Lambda ifadesi — "isimsiz fonksiyon"

```csharp
e => e.Status == ContentStatus.Published
```

Bu, "parametre `e` alır, `e.Status == Published` sonucunu döner" diyen isimsiz bir fonksiyondur. Türü bağlama göre bir **delegate**'tir:

```csharp
Func<int, int> kare = x => x * x;          // int alır, int döner
Func<int, int, int> topla = (a, b) => a + b;
Action<string> yaz = s => Console.WriteLine(s);   // değer dönmez
Predicate/Func<Event, bool> filtre = e => e.IsActive;

// Gövdeli hali (birden fazla satır gerekiyorsa)
Func<int, int> f = x => { var y = x * 2; return y + 1; };
```

LINQ'nun tamamı bunun üstüne kurulu — projendeki her `Where`, `Select`, `FirstOrDefault` çağrısına lambda veriyorsun:

```csharp
query.Where(e => e.CategoryId == request.CategoryId)
     .Select(e => new Response { Id = e.Id, Name = e.Name })
```

**Closure detayı**: lambda, dışarıdaki değişkenleri "yakalar":

```csharp
var now = DateTime.UtcNow;
query = query.Where(e => e.StartDate >= now);   // now dışarıdan yakalandı
```

Bunu senin `EventService.GetAllAsync`'in aynen yapıyor. Yakalanan değişken *referans* olarak tutulur; döngü değişkeni yakalarken dikkat gerektirir.

### b) Expression-bodied member — kısa metot/property yazımı

Tek ifadelik metot ve property'lerde `{ return ...; }` yerine kısayol:

```csharp
// Projendeki gerçek örnekler:
private bool IsAdmin() => User.IsInRole("Admin");                      // UserController
public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(...);   // PagedResponse
private static Response ToResponse(Announcement a) => new() { ... };   // AnnouncementService
```

Burada lambda yok; sadece "bu üyenin gövdesi şu tek ifadedir" demenin kısa sözdizimi. `TotalPages` örneği ayrıca **computed property**: alan tutmaz, her okunduğunda hesaplar.

---

## 6. Expression (İfade Ağaçları)

> Not: Listendeki "Experience" büyük ihtimalle "Expression" olacaktı — `=>` konusunun doğal devamı olduğu için öyle yorumluyorum.

### Aynı lambda, iki farklı tip

```csharp
Func<Event, bool>               f1 = e => e.Status == ContentStatus.Published;
Expression<Func<Event, bool>>   f2 = e => e.Status == ContentStatus.Published;
```

Görünüşleri aynı ama:

- `f1` (**Func**) → derlenmiş, çalıştırılabilir **makine kodu**. İçine bakılamaz; sadece çağrılır.
- `f2` (**Expression**) → kodun kendisinin **veri yapısı olarak temsili** (ağaç): "parametre `e` → property erişimi `Status` → eşitlik → sabit `Published`". Çalıştırılamaz ama **okunabilir ve başka bir dile çevrilebilir**.

```
        ==
       /  \
  e.Status  ContentStatus.Published
```

### EF Core'un tüm sihri bu farkta

`IQueryable`'ın metotları `Expression` alır, `IEnumerable`/List'inkiler `Func` alır:

```csharp
// IQueryable: lambda Expression olarak gider → EF ağacı okur → SQL üretir
_dbContext.Events.Where(e => e.Status == ContentStatus.Published)
// SQL: SELECT ... FROM "Event" WHERE "Status" = 'Published'   ← filtre DB'de çalışır

// IEnumerable: önce TÜM tablo çekilir, filtre C#'ta Func ile çalışır — FELAKET
_dbContext.Events.AsEnumerable().Where(e => e.Status == ContentStatus.Published)
```

Yazdığın kod bire bir aynı görünür ama performans farkı devasadır. `GetAllAsync`'te `query`'nin sonuna kadar `IQueryable` kalması (ve `ToListAsync`'e kadar hiçbir şeyin çalışmaması — *deferred execution*) bu yüzden önemli.

Bundan çıkan pratik kurallar:

- EF sorgusundaki lambda'nın içinde **SQL'e çevrilemeyecek şey kullanamazsın** (kendi C# metodun, karmaşık nesneler...) — çevrilemezse EF exception fırlatır. `EF.Functions.ILike(...)` gibi yardımcılar tam da "bunu SQL'e böyle çevir" demek için var.
- Filtrelemeyi hep `IQueryable` üzerinde bitir; `ToList`/`AsEnumerable`'ı olabildiğince geç çağır.

### İleri seviye: elle ağaç kurmak

Dinamik sorgu üretmek gerektiğinde (örn. "kullanıcı hangi kolona göre sıralamak istediyse") ağaç elle kurulabilir:

```csharp
var param = Expression.Parameter(typeof(Event), "e");
var body  = Expression.Equal(
    Expression.Property(param, nameof(Event.Status)),
    Expression.Constant(ContentStatus.Published));
var lambda = Expression.Lambda<Func<Event, bool>>(body, param);

query = query.Where(lambda);          // EF için Expression
var func = lambda.Compile();          // istersen çalıştırılabilir Func'a derle
```

Günlük işte nadiren gerekir ama EF'in, FluentValidation'ın (`RuleFor(x => x.Title)` — property'yi Expression ile tanır!), AutoMapper'ın altında hep bu mekanizma çalışır.

---

## Kapanış — Konuların Birbirine Bağlantısı

- `=>` lambda yazdırır → lambda `Func` ya da `Expression` olur → `Expression` sayesinde EF Core LINQ'yu SQL'e çevirir (**Code First** modelinin sorgulanması).
- Bu sorgular **async**tir (`ToListAsync`) → `await` ile thread bloklamadan beklenir → `CancellationToken` ile iptal edilebilir.
- Dış servislere gidecek olursan aynı async + token düzeni **HttpClient**'ta da geçerlidir.

Yani altı başlık ayrı konular değil; modern .NET backend'inin tek bir hikâyesinin parçaları.
