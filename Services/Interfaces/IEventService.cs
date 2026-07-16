using Announcement_and_Event_Track_App.Dtos.Event;

namespace Announcement_and_Event_Track_App.Services.Interfaces;

public interface IEventService
{

    Task<Response> Create(CreateRequest createRequest);
    Task<List<Response>> GetAllAsync(bool includeUnactivated = false);
    Task<Response?> GetByIdAsync(Guid eventId);
    Task<Response?> UpdateAsync(UpdateRequest request);
    Task<Response?> PublishAsync(Guid eventId);
    Task<Response?> UnpublishAsync(Guid eventId);
    Task<bool> ArchiveAsync(Guid eventId);
}