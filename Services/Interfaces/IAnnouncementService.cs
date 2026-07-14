using Announcement_and_Event_Track_App.Dtos.Announcement;

namespace Announcement_and_Event_Track_App.Services.Interfaces;

public interface IAnnouncementService
{
    
    Task<Response?> GetByIdAsync(Guid announcementId);
    Task<List<Response>> GetAllAsync(bool includeUnactivated = false);
    Task<Response> CreateAsync(CreateRequest request);
    Task<Response?> UpdateAsync(UpdateRequest request);
    
    Task<Response?> PublishAsync(Guid announcementId);
    Task<Response?> UnpublishAsync(Guid announcementId);
    Task<bool> ArchiveAsync(Guid announcementId);
    
}