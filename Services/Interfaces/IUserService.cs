using Announcement_and_Event_Track_App.Dtos.User;

namespace Announcement_and_Event_Track_App.Services.Interfaces;

public interface IUserService
{
    Task<List<UserResponse>> GetAllAsync();                          // Admin
    Task<UserResponse> GetByIdAsync(Guid id);
    Task<UserResponse> UpdateAsync(Guid id, UpdateRequest request, Guid currentUserId);
    Task DeactivateAsync(Guid id); 
    Task DeleteAsync(Guid id);
}