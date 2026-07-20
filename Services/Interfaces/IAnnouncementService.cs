using Announcement_and_Event_Track_App.Dtos.Announcement;
using Announcement_and_Event_Track_App.Dtos.Common;

namespace Announcement_and_Event_Track_App.Services.Interfaces;

public interface IAnnouncementService
{
    Task<Response?> GetByIdAsync(Guid announcementId, bool isAdmin);
    Task<PagedResponse<Response>> GetAllAsync(ListRequest request, bool isAdmin, CancellationToken cancellationToken);
    Task<Response> CreateAsync(CreateRequest request, Guid currentUserId);
    Task<Response?> UpdateAsync(UpdateRequest request, Guid currentUserId, bool isAdmin);
    
    Task<Response?> PublishAsync(Guid announcementId, Guid currentUserId);
    Task<Response?> UnpublishAsync(Guid announcementId, Guid currentUserId);
    Task<bool> ArchiveAsync(Guid announcementId, Guid currentUserId);
}