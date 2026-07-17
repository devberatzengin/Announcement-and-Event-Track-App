using Announcement_and_Event_Track_App.Data;
using Announcement_and_Event_Track_App.Dtos.Category;
using Announcement_and_Event_Track_App.Entitys;
using Announcement_and_Event_Track_App.Entitys.Enums;
using Announcement_and_Event_Track_App.Excepitons;
using Announcement_and_Event_Track_App.Services.Interfaces;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using ValidationException = Announcement_and_Event_Track_App.Excepitons.ValidationException;


namespace Announcement_and_Event_Track_App.Services;

public class CategoryService : ICategoryService
{
    
    private readonly AppDbContext _dbContext;
    private readonly ILogger<AnnouncementService> _logger;
    private readonly IValidator<CreateRequest> _createValidator;
    private readonly IValidator<UpdateRequest> _updateValidator;
    public CategoryService(AppDbContext dbContext, ILogger<AnnouncementService> logger, IValidator<CreateRequest> createValidator, IValidator<UpdateRequest> updateValidator)
    {
        _dbContext = dbContext;
        _logger = logger;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }
    
    
    public async Task<Response> CreateAsync(CreateRequest createRequest)
    {
        
        var validation = await _createValidator.ValidateAsync(createRequest);

        if (!validation.IsValid)
            throw new ValidationException(validation.ToDictionary());
        
        
        bool nameExist = await _dbContext.Categories
            .AnyAsync(c => c.Name == createRequest.Name);
        
        if (nameExist)
            throw new ConflictException($"'{createRequest.Name}' adında kategori zaten var.");
        
        Category newCategory = new Category
        {
            Id = Guid.NewGuid(),
            Name = createRequest.Name,
            Type = createRequest.Type,
            IsActive = true,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _dbContext.Categories.Add(newCategory);
        await _dbContext.SaveChangesAsync();
        
        _logger.LogInformation("Category created {@newCategory.id}", newCategory.Id);
        // _logger.LogCritical("Category created {newCategory.id}", newCategory.Id);
        // _logger.LogDebug("Category created {newCategory.id}", newCategory.Id);
        // _logger.LogError("Category created {newCategory.id}", newCategory.Id);
        // _logger.LogTrace("Category created {newCategory.id}", newCategory.Id);
        // _logger.LogWarning("Category created {newCategory.id}", newCategory.Id);
        return new Response
        {
            Id = newCategory.Id,
            Name = newCategory.Name,
            Type = newCategory.Type,
            IsActive = newCategory.IsActive
        };
        
    }

    public async Task<List<Response>> GetAllAsync(bool includeUnactivated = false)
    {
        var categories =  await _dbContext.Categories
            .Where(c => includeUnactivated || c.IsActive)
            .ToListAsync();
        
        if (categories is null)
            throw new NotFoundException(nameof(Category), "");
        
        var responses = new List<Response>();
        foreach (var category in categories)
        {
            responses.Add(new Response
            {
                Id = category.Id,
                Name = category.Name,
                Type = category.Type,
                IsActive = category.IsActive
            });
        }
        
        return responses;
        
    }
    
    public async Task<Response?> GetByIdAsync(Guid categoryId,bool includeUnactivated = false)
    {
        var category = await _dbContext.Categories
            .AsNoTracking()                                        // salt okuma
            .Where(c => c.Id == categoryId)
            .Where(c => includeUnactivated || c.IsActive)          // pasifler dahil mi?
            .FirstOrDefaultAsync();  
        
        if (category is null)
            throw new NotFoundException(nameof(Category), categoryId);        
        
        return new Response()
        {
            Id = category.Id,
            Name = category.Name,
            Type = category.Type,
            IsActive = category.IsActive
        };

    }

    public async Task<Response?> UpdateAsync(UpdateRequest updateRequest)
    {
        var validation = await _updateValidator.ValidateAsync(updateRequest);
        
        if (!validation.IsValid)
            throw new ValidationException(validation.ToDictionary());
        
        var category = await _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == updateRequest.Id);

        if (category is null)
            throw new NotFoundException(nameof(Category), updateRequest.Id);
        
        bool nameExist = await _dbContext.Categories.AnyAsync(c => c.Name == updateRequest.Name);
        
        if (nameExist)
            throw new ConflictException($"'{updateRequest.Name}' adında kategori zaten var.");
        
        category.Name = updateRequest.Name;
        category.Type = updateRequest.Type;
        category.IsActive = updateRequest.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new Response()
        {
            Id = category.Id,
            Name = category.Name,
            Type = category.Type,
            IsActive = category.IsActive
        };
    }

    public async Task<Response?> DeactivateAsync(Guid categoryId)
    {
        var category = await _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == categoryId); 
        
        if (category is null)
            throw new NotFoundException(nameof(Category), categoryId);
        
        category.IsActive = false;
        category.UpdatedAt = DateTime.UtcNow;
        
        await _dbContext.SaveChangesAsync();
        
        return new Response()
        {
            Id = category.Id,
            Name = category.Name,
            Type = category.Type,
            IsActive = category.IsActive
        };

    }

    public async Task<bool> DeleteAsync(Guid categoryId)
    {
        var category = await _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == categoryId);
        
        if (category is null)
            throw new NotFoundException(nameof(Category), categoryId);
            
        category.IsDeleted = true;
        category.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
        
        return true;
    }
}