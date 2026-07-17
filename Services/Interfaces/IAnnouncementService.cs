using Announcement_and_Event_Track_App.Dtos.Announcement;

namespace Announcement_and_Event_Track_App.Services.Interfaces;

public interface IAnnouncementService
{
    
    Task<Response?> GetByIdAsync(Guid announcementId);
    Task<List<Response>> GetAllAsync(bool includeUnactivated = false);
    Task<Response> CreateAsync(CreateRequest request, Guid currentUserId);
    Task<Response?> UpdateAsync(UpdateRequest request, Guid currentUserId);
    
    Task<Response?> PublishAsync(Guid announcementId, Guid currentUserId);
    Task<Response?> UnpublishAsync(Guid announcementId, Guid currentUserId);
    Task<bool> ArchiveAsync(Guid announcementId, Guid currentUserId);
    
}