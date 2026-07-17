using Announcement_and_Event_Track_App.Data;
using Announcement_and_Event_Track_App.Dtos.Announcement;
using Announcement_and_Event_Track_App.Entitys;
using Announcement_and_Event_Track_App.Excepitons;
using Announcement_and_Event_Track_App.Services.Interfaces;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using ValidationException = Announcement_and_Event_Track_App.Excepitons.ValidationException;

namespace Announcement_and_Event_Track_App.Services;

public class AnnouncementService : IAnnouncementService
{           
    private readonly AppDbContext _dbContext;
    private readonly ILogger<AnnouncementService> _logger;
    private readonly IValidator<CreateRequest> _createValidator;
    private readonly IValidator<UpdateRequest> _updateValidator;
    
    
    public AnnouncementService(AppDbContext dbContext, ILogger<AnnouncementService> logger, IValidator<CreateRequest> createValidator, IValidator<UpdateRequest> updateValidator)
    {
        _logger = logger;
        _dbContext = dbContext;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }
    
    
    public async Task<Response?> GetByIdAsync(Guid announcementId)
    {
        var result = await _dbContext.Announcements
            .Include(a => a.Category)
            .Include(a => a.CreatedBy)
            .Where(a => a.Id == announcementId)
            .FirstOrDefaultAsync();

        if (result is null)
            throw new NotFoundException(nameof(Announcement), announcementId);
        
        return new Response()
        {
            Id = result.Id,
            Title = result.Title,
            Content = result.Content,
            CreatedByName = result.CreatedBy.FirstName + " " + result.CreatedBy.LastName,
            CategoryId = result.CategoryId,
            CategoryName = result.Category.Name, 
            IsActive = result.IsActive,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt
        };
    }
    
    public async Task<List<Response>> GetAllAsync(bool includeUnactivated = false)
    {
        var announcements = await _dbContext.Announcements
            .Where(a => includeUnactivated || a.IsActive)
            .Join(_dbContext.Users,
                a => a.CreatedByUserId,
                u => u.Id,
                (a, u) => new Response
                {
                    Id = a.Id,
                    Title = a.Title,
                    Content = a.Content,
                    CreatedByName = u.FirstName + " " + u.LastName,
                    CategoryName = a.Category.Name,
                    CategoryId = a.CategoryId,
                    IsActive = a.IsActive,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
            .ToListAsync();

        _logger.LogInformation("Getting announcements {Count}", announcements.Count);
        
        return announcements;
    }

    public async Task<Response> CreateAsync(CreateRequest request, Guid currentUserId)
    {
        
        var validation = await _createValidator.ValidateAsync(request);
        
        if (!validation.IsValid)
            throw new ValidationException(validation.ToDictionary());
        
        var category = await _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == request.CategoryId);
        
        if (category is null)
            throw new NotFoundException(nameof(Category), request.CategoryId);
        
        var nameCount = await _dbContext.Announcements
            .CountAsync(a => a.Title == request.Title || a.Title.StartsWith(request.Title + " "));
        
        var title = nameCount > 0 ? $"{request.Title} {nameCount + 1}" : request.Title;
        
        var creator = await _dbContext.Users
            .Where(u => u.Id == currentUserId)
            .Select(u => new { u.FirstName, u.LastName })
            .FirstAsync();
        
        Announcement newAnnouncement = new Announcement
        {
            Id = Guid.NewGuid(),
            Title = title,
            Content = request.Content,
            CreatedByUserId = currentUserId,
            
            CategoryId = request.CategoryId,
            
            IsActive = true,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _dbContext.Announcements.Add(newAnnouncement);
        await _dbContext.SaveChangesAsync();
        
        _logger.LogInformation("Created announcement {AnnouncementId} with title {Title} by user {UserId}", newAnnouncement.Id, title, currentUserId);
        
        return new Response()
        {
            Id = newAnnouncement.Id,
            Title = newAnnouncement.Title,
            Content = newAnnouncement.Content,
            CreatedByName = creator.FirstName + " " + creator.LastName,

            CategoryName = category.Name,
            CategoryId = newAnnouncement.CategoryId,

            IsActive = newAnnouncement.IsActive,

            CreatedAt = newAnnouncement.CreatedAt,
            UpdatedAt = newAnnouncement.UpdatedAt
        };

    }



    public async Task<Response?> UpdateAsync(UpdateRequest request, Guid currentUserId)
    {
        var validation = await _updateValidator.ValidateAsync(request);
        
        if (!validation.IsValid)
            throw new ValidationException(validation.ToDictionary());

        var announcement = await _dbContext.Announcements.FirstOrDefaultAsync(a => a.Id == request.Id);
        
        if (announcement is null)
            throw new NotFoundException(nameof(Announcement), request.Id);
        
        if (announcement.CreatedByUserId != currentUserId)
            throw new ForbiddenException("Sadece kendi duyurunu güncelleyebilirsin.");
        
        var categoryExists = await _dbContext.Categories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists)
            throw new NotFoundException(nameof(Category), request.CategoryId);
        
        var nameCount = await _dbContext.Announcements
            .CountAsync(a => a.Id != announcement.Id &&
                (a.Title == request.Title || a.Title.StartsWith(request.Title + " ")));
        
        var title = nameCount > 0 ? $"{request.Title} {nameCount + 1}" : request.Title;
        
        announcement.Title = title;
        announcement.Content = request.Content;
        announcement.CategoryId = request.CategoryId;
        announcement.IsActive = request.IsActive;
        announcement.UpdatedAt = DateTime.UtcNow;
        
        await _dbContext.SaveChangesAsync();
        
        _logger.LogInformation("Updated announcement {AnnouncementId} with title {Title} by user {UserId}", announcement.Id, title, currentUserId);

        
        return new Response()
        {
            Id = announcement.Id,
            Title = announcement.Title,
            Content = announcement.Content,
            CategoryId = announcement.CategoryId,
            IsActive = announcement.IsActive
        };
    }
    
    public async Task<Response?> PublishAsync(Guid announcementId, Guid currentUserId)
    {

        var announcement = await _dbContext.Announcements
            .Include(a => a.Category)
            .Include(a => a.CreatedBy)
            .FirstOrDefaultAsync(a => a.Id == announcementId);
        
        if (announcement is null)
            throw new NotFoundException(nameof(Announcement), announcementId);
        
        if (announcement.CreatedByUserId != currentUserId)
            throw new ForbiddenException("Sadece kendi duyurunu yayınlayabilirsin.");
        
        announcement.IsActive = true;
        announcement.UpdatedAt = DateTime.UtcNow;
        
        await _dbContext.SaveChangesAsync();
        
        _logger.LogInformation("Published announcement {AnnouncementId} by user {UserId}", announcement.Id, currentUserId);

        return new Response()
        {
            Id = announcement.Id,
            Title = announcement.Title,
            Content = announcement.Content,
            CreatedByName =  announcement.CreatedBy.FirstName + " " + announcement.CreatedBy.LastName,
            CategoryName = announcement.Category.Name,
            CategoryId = announcement.CategoryId,
            IsActive = announcement.IsActive,
            CreatedAt = announcement.CreatedAt,
            UpdatedAt = announcement.UpdatedAt
        };
    }

    public async Task<Response?> UnpublishAsync(Guid announcementId, Guid currentUserId)
    {
        var announcement = await _dbContext.Announcements
            .Include(a => a.Category)
            .Include(a => a.CreatedBy)
            .FirstOrDefaultAsync(a => a.Id == announcementId);
        
        if (announcement is null)
            throw new NotFoundException(nameof(Announcement), announcementId);
        
        if (announcement.CreatedByUserId != currentUserId)
            throw new ForbiddenException("Sadece kendi duyurunu yayından kaldırabilirsin.");
        
        announcement.IsActive = false;
        announcement.UpdatedAt = DateTime.UtcNow;
        
        await _dbContext.SaveChangesAsync();
        
        _logger.LogInformation("Unpublished announcement {AnnouncementId} by user {UserId}", announcement.Id, currentUserId);

        
        return new Response()
        {
            Id = announcement.Id,
            Title = announcement.Title,
            Content = announcement.Content,
            CreatedByName =  announcement.CreatedBy.FirstName + " " + announcement.CreatedBy.LastName,
            CategoryName = announcement.Category.Name,
            CategoryId = announcement.CategoryId,
            IsActive = announcement.IsActive,
            CreatedAt = announcement.CreatedAt,
            UpdatedAt = announcement.UpdatedAt
        };
    }

    // Delete Method
    public async Task<bool> ArchiveAsync(Guid announcementId, Guid currentUserId)
      {
          var announcement = await _dbContext.Announcements.FirstOrDefaultAsync(a => a.Id == announcementId);
          
          if (announcement is null)
              throw new NotFoundException(nameof(Announcement), announcementId);
          
          if (announcement.CreatedByUserId != currentUserId)
              throw new ForbiddenException("Sadece kendi duyurunu arşivleyebilirsin.");
          
          announcement.IsDeleted = true;
          announcement.UpdatedAt = DateTime.UtcNow;
          
          await _dbContext.SaveChangesAsync();
          
          _logger.LogInformation("Archived announcement {AnnouncementId} by user {UserId}", announcement.Id, currentUserId);
          
          return true;
      }
}