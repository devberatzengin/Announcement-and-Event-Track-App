using Announcement_and_Event_Track_App.Data;
using Announcement_and_Event_Track_App.Dtos.User;
using Announcement_and_Event_Track_App.Entitys;
using Announcement_and_Event_Track_App.Excepitons;
using Announcement_and_Event_Track_App.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Announcement_and_Event_Track_App.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _dbContext;
    public UserService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public async Task<List<UserResponse>> GetAllAsync()
    {
        return await _dbContext.Users
            .Select(u => new UserResponse
            {
                Id = u.Id,
                UserName =  u.Username,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Type = u.Type,
                CreatedAt =  u.CreatedAt
            })
            .ToListAsync();
    }


    public async Task<UserResponse> GetByIdAsync(Guid id) // Admin Method
    {
        var result =  await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (result is null)
            throw new NotFoundException(nameof(User), id);

        return new UserResponse()
        {
            Id = result.Id,
            Email = result.Email,
            UserName = result.Username,
            FirstName = result.FirstName,
            LastName = result.LastName,
            Type = result.Type,
            CreatedAt = result.CreatedAt
        };
    }
    
    public async Task<UserResponse> UpdateAsync(Guid id, UpdateRequest request, Guid currentUserId)
    {

        if (id != currentUserId)
        {
            throw new ForbiddenException("Sen Başka Birisini güncellemeye çalışıyorsun");
        }

        var dbUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (dbUser is null)
            throw new NotFoundException(nameof(User), id);
        
        dbUser.FirstName = request.FirstName;
        dbUser.LastName = request.LastName;
        
        _dbContext.Users.Update(dbUser);
        await _dbContext.SaveChangesAsync();
        return new UserResponse()
        {
            Id = dbUser.Id,
            Email = dbUser.Email,
            UserName = dbUser.Username,

            FirstName = dbUser.FirstName,
            LastName = dbUser.LastName,

            Type = dbUser.Type,
            CreatedAt = dbUser.CreatedAt
        };

    }

    public async Task DeactivateAsync(Guid id) // Admin Endpoind yine
    {
         var dbUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
         if (dbUser is null)
             throw new NotFoundException(nameof(User), id);
         
         dbUser.IsActive = false;
         await _dbContext.SaveChangesAsync();
         
        
    }

    public async Task DeleteAsync(Guid id)
    {
        var dbUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
        
        if (dbUser is null)
            throw new NotFoundException(nameof(User), id);
        
        dbUser.IsDeleted = true;
        await _dbContext.SaveChangesAsync();
    }
}