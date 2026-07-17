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
        var result = await _dbContext.Announcements.
            Include(a => a.Category)
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
        _logger.LogInformation("Getting all announcements");
        var announcements = await _dbContext.Announcements.
            Where(a => includeUnactivated || a.IsActive)
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

        var response =  new List<Response>();
        
        foreach (var announcement in announcements)
        {
            response.Add(new Response
            {   
                Id = announcement.Id,
                Title = announcement.Title,
                Content = announcement.Content,
                CreatedByName = announcement.CreatedByName,
                CategoryName =  announcement.CategoryName,
                CategoryId =  announcement.CategoryId,
                IsActive = announcement.IsActive,
                CreatedAt = announcement.CreatedAt,
                UpdatedAt = announcement.UpdatedAt
            });
        }
        return response;
    }

    public async Task<Response> CreateAsync(CreateRequest request)
    {
        
        var validation = await _createValidator.ValidateAsync(request);
        if (!validation.IsValid)
            throw new ValidationException(validation.ToDictionary());
        
        var nameCount =  _dbContext.Announcements
            .Count(a => a.Title == request.Title || a.Title.StartsWith(request.Title + " "));
        
        var category =  _dbContext.Categories.First(c => c.Id == request.CategoryId);

        if (category is null)
            throw new Exception($"{request.CategoryId}  not found", new NotFoundException(nameof(Category), request.CategoryId));
        
        var title = nameCount > 0 ? $"{request.Title} {nameCount + 1}" : request.Title;
        
        // TEMP CODE !
        var systemUser =  _dbContext.Users.First(); 

        Announcement newAnnouncement = new Announcement
        {
            Id = Guid.NewGuid(),
            Title = title,
            Content = request.Content,
            CreatedByUserId = systemUser.Id, // JWT EKSİK ŞUAN  ve muhtemelen 2.sinde patlayacak
            CreatedBy = systemUser, // JWT EKSİK ŞUAN
            
            CategoryId = request.CategoryId,
            Category = category,
            
            IsActive = true,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _dbContext.Announcements.Add(newAnnouncement);
        await _dbContext.SaveChangesAsync();
        
        return new Response()
        {
            Id = newAnnouncement.Id,
            Title = newAnnouncement.Title,
            Content = newAnnouncement.Content,
            CreatedByName = newAnnouncement.CreatedBy.FirstName + " " + newAnnouncement.CreatedBy.LastName,

            CategoryName = newAnnouncement.Category.Name,
            CategoryId = newAnnouncement.CategoryId,

            IsActive = newAnnouncement.IsActive,

            CreatedAt = newAnnouncement.CreatedAt,
            UpdatedAt = newAnnouncement.UpdatedAt
        };

    }

    public async Task<Response?> UpdateAsync(UpdateRequest request)
    {
        var validation = await _updateValidator.ValidateAsync(request);
        
        if (!validation.IsValid)
            throw new ValidationException(validation.ToDictionary());

        var announcement = await _dbContext.Announcements.FirstAsync(a => a.Id == request.Id);
        
        if (announcement is null)
            throw new NotFoundException(nameof(Announcement), request.Id);
        
        
        var categoryExists =  _dbContext.Categories.Any(c => c.Id == request.CategoryId);
        if (!categoryExists)
            throw new Exception($"{request.CategoryId}  not found", new NotFoundException(nameof(Category), request.CategoryId));
        
        var nameCount = await _dbContext.Announcements
            .CountAsync(a => a.Title == request.Title || a.Title.StartsWith(request.Title + " "));
        
        var title = nameCount > 0 ? $"{request.Title} {nameCount + 1}" : request.Title;
        
        announcement.Title = title;
        announcement.Content = request.Content;
        announcement.CategoryId = request.CategoryId;
        announcement.IsActive = request.IsActive;
        
        _dbContext.Announcements.Update(announcement);
        await _dbContext.SaveChangesAsync();
        return new Response()
        {
            Id = announcement.Id,
            Title = announcement.Title,
            Content = announcement.Content,
            CategoryId = announcement.CategoryId,
            IsActive = announcement.IsActive
        };
    }
    
    public async Task<Response?> PublishAsync(Guid announcementId)
    {

        var  announcement =  _dbContext.Announcements
            .Include(a => a.Category)
            .Include(u => u.CreatedBy)
            .FirstOrDefault(a => a.Id == announcementId);
        
        if (announcement is null)
            throw new NotFoundException(nameof(Announcement), announcementId);
        
        announcement.IsActive = true;
        announcement.UpdatedAt = DateTime.UtcNow;
        _dbContext.Announcements.Update(announcement);
        
        await _dbContext.SaveChangesAsync();
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

    public async Task<Response?> UnpublishAsync(Guid announcementId)
    {
        var  announcement =  _dbContext.Announcements
            .Include(a => a.Category)
            .Include(u => u.CreatedBy)
            .FirstOrDefault(a => a.Id == announcementId);
        
        if (announcement is null)
            throw new NotFoundException(nameof(Announcement), announcementId);
        
        announcement.IsActive = false;
        announcement.UpdatedAt = DateTime.UtcNow;
        _dbContext.Announcements.Update(announcement);
        
        await _dbContext.SaveChangesAsync();
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
    public async Task<bool> ArchiveAsync(Guid announcementId)
      {
          var announcement = await _dbContext.Announcements.FirstOrDefaultAsync(a => a.Id == announcementId);
          
          if (announcement is null)
              throw new NotFoundException(nameof(Announcement), announcementId);
          
          announcement.IsDeleted = true;
          announcement.UpdatedAt = DateTime.UtcNow;
          
          await _dbContext.SaveChangesAsync();
          return true;
      }
}