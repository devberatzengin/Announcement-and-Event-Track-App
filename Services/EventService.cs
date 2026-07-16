using System.ComponentModel.Design;
using Announcement_and_Event_Track_App.Data;
using Announcement_and_Event_Track_App.Dtos.Event;
using Announcement_and_Event_Track_App.Entitys;
using Announcement_and_Event_Track_App.Excepitons;
using Announcement_and_Event_Track_App.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using ValidationException = System.ComponentModel.DataAnnotations.ValidationException;

namespace Announcement_and_Event_Track_App.Services;

public class EventService : IEventService
{
    private readonly AppDbContext _dbContext;
    public EventService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public async Task<Response> CreateAsync(CreateRequest createRequest)
    {
        
        //JWT CHECK SONRA
        
        var nameCount =  _dbContext.Events
            .Count(e => e.Name == createRequest.Name || e.Name.StartsWith(createRequest.Name + " "));
        
        var title = nameCount > 0 ? $"{createRequest.Name} {nameCount + 1}" : createRequest.Name;
        
        var categoryCheck = _dbContext.Categories.FirstOrDefault(c => c.Id == createRequest.CategoryId);
        
        if (categoryCheck is null)
            throw new NotFoundException(nameof(Category), createRequest.CategoryId);

        if (createRequest.EndDate <= DateTime.Now)
            throw new Excepitons.ValidationException("Bitiş tarihi geçmiş bir zaman olamaz.");
        if (createRequest.EndDate <= createRequest.StartDate)
            throw new Excepitons.ValidationException("Başlangış bitişden sonra olamaz.");

        
        Event newEvent = new Event()
        {
            Id = Guid.NewGuid(),
            Name = title,
            Description = createRequest.Description,
            Location = createRequest.Location,
            CategoryId = createRequest.CategoryId,
            Category = categoryCheck,
            StartDate = DateTime.Now,
            EndDate = DateTime.Now,
            
            
            CreatedAt =  DateTime.UtcNow,
            UpdatedAt =  DateTime.UtcNow,
            IsActive = true,
            IsDeleted =  false
        };
        
        _dbContext.Events.Add(newEvent);
        await _dbContext.SaveChangesAsync();

        return new Response()
        {
            Id = newEvent.Id,
            Name = newEvent.Name,
            Description = newEvent.Description,
            Location = newEvent.Location,

            StartDate = newEvent.StartDate,
            EndDate = newEvent.EndDate,

            CategoryId = newEvent.CategoryId,

            IsActive = newEvent.IsActive,
            IsDeleted = newEvent.IsDeleted,
            CreatedAt = newEvent.CreatedAt
        };

    }

    public async Task<List<Response>> GetAllAsync(bool includeUnactivated = false)
    {
        var events = await _dbContext.Events.Where(e => includeUnactivated || e.IsActive).ToListAsync();

        var response = new List<Response>();
        
        foreach (var eventItem in events)
        {
            response.Add(new Response()
            {
                Id = eventItem.Id,
                Name = eventItem.Name,
                Description = eventItem.Description,
                Location = eventItem.Location,
                StartDate = eventItem.StartDate,
                EndDate = eventItem.EndDate,
                CategoryId = eventItem.CategoryId,
                IsActive = eventItem.IsActive,
                IsDeleted = eventItem.IsDeleted,
                CreatedAt = eventItem.CreatedAt,
                UpdatedAt = eventItem.UpdatedAt
            });
        }
        
        return response;
        
    }

    public async Task<Response?> GetByIdAsync(Guid eventId)
    {
        var result =  await _dbContext.Events.FirstOrDefaultAsync(e => e.Id == eventId);
        
        if (result is null)
            throw new NotFoundException(nameof(Event), eventId);

        return new Response()
        {
            Id = result.Id,
            Name = result.Name,
            Description = result.Description,
            Location = result.Location,

            StartDate = result.StartDate,
            EndDate = result.EndDate,

            CategoryId = result.CategoryId,

            IsActive = result.IsActive,
            IsDeleted = result.IsDeleted,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt
        };

    }

    public async Task<Response?> UpdateAsync(UpdateRequest request)
    {
        var result =  await _dbContext.Events.FirstOrDefaultAsync(e => e.Id == request.Id);
        
        if  (result is null)
            throw new NotFoundException(nameof(Event), request.Id);
        
        // Burda bir mantık hatası var hepsini elle böyle  böyle nereye kadar mantıken bir yolu vardır da
        result.Name = request.Name;
        result.Description = request.Description;
        result.Location = request.Location;
        result.StartDate = request.StartDate;
        result.EndDate = request.EndDate;
        result.CategoryId = request.CategoryId;
        result.IsActive = request.IsActive;
        result.IsDeleted = request.IsDeleted;
        result.UpdatedAt = DateTime.UtcNow;
        
        _dbContext.Events.Update(result);
        await _dbContext.SaveChangesAsync();

        return new Response()
        {
            Id = result.Id,
            Name = result.Name,
            Description = result.Description,
            Location = result.Location,

            StartDate = result.StartDate,
            EndDate = result.EndDate,

            CategoryId = result.CategoryId,

            IsActive = result.IsActive,
            IsDeleted = result.IsDeleted,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt
        };

    }

    public async Task<Response?> PublishAsync(Guid eventId)
    {
        var result =  _dbContext.Events.FirstOrDefault(e => e.Id == eventId);
        if (result is null)
            throw new NotFoundException(nameof(Event), eventId);
        
        result.IsActive = true;
        result.UpdatedAt = DateTime.UtcNow;
        _dbContext.Events.Update(result);
        await _dbContext.SaveChangesAsync();

        return new Response()
        {
            Id = result.Id,
            Name = result.Name,
            Description = result.Description,
            Location = result.Location,

            StartDate = result.StartDate,
            EndDate = result.EndDate,

            CategoryId = result.CategoryId,

            IsActive = result.IsActive,
            IsDeleted = result.IsDeleted,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt
        };
    }

    public async Task<Response?> UnpublishAsync(Guid eventId)
    {
        var result =  _dbContext.Events.FirstOrDefault(e => e.Id == eventId);
        
        if (result is null)
            throw new NotFoundException(nameof(Event), eventId);
        
        result.IsActive = false;
        result.UpdatedAt = DateTime.UtcNow;
        _dbContext.Events.Update(result);
        await _dbContext.SaveChangesAsync();

        return new Response()
        {
            Id = result.Id,
            Name = result.Name,
            Description = result.Description,
            Location = result.Location,

            StartDate = result.StartDate,
            EndDate = result.EndDate,

            CategoryId = result.CategoryId,

            IsActive = result.IsActive,
            IsDeleted = result.IsDeleted,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt
        };
    }

    public async Task<bool> ArchiveAsync(Guid eventId)
    {
        var result =  _dbContext.Events.FirstOrDefault(e => e.Id == eventId);
        
        if (result is null)
            throw new NotFoundException(nameof(Event), eventId);
        
        result.IsDeleted = true;
        result.UpdatedAt = DateTime.UtcNow;
        _dbContext.Events.Update(result);
        await _dbContext.SaveChangesAsync();
        
        return true;
        
    }
}