using Announcement_and_Event_Track_App.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Announcement_and_Event_Track_App.Dtos.Event;

namespace Announcement_and_Event_Track_App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventController : ControllerBase
{
    private readonly IEventService _eventService;
    public EventController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpPost]
    public Task<Response> Create(CreateRequest createRequest)
    {
        return _eventService.Create(createRequest);
    }

    [HttpGet]
    public Task<List<Response>> GetAllAsync(bool includeUnactivated = false)
    {
        return _eventService.GetAllAsync(includeUnactivated);
    }

    [HttpGet("{eventId:guid}")]
    public Task<Response?> GetByIdAsync(Guid eventId)
    {
        return _eventService.GetByIdAsync(eventId);
    }

    [HttpPut("{eventId:guid}")]
    public Task<Response?> UpdateAsync(Guid eventId,UpdateRequest request)
    {
        request.Id = eventId;
        return _eventService.UpdateAsync(request);
    }

    [HttpPatch("{eventId:guid}/publish")]
    public Task<Response?> PublishAsync(Guid eventId)
    {
        return _eventService.PublishAsync(eventId);
    }

    [HttpPatch("{eventId:guid}/unpublish")]
    public Task<Response?> UnpublishAsync(Guid eventId)
    {
        return _eventService.UnpublishAsync(eventId);
    }

    [HttpDelete]
    public Task<bool> ArchiveAsync(Guid eventId)
    {
        return _eventService.ArchiveAsync(eventId);
    }



}