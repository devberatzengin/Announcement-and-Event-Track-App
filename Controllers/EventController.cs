using System.Formats.Asn1;
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

    [ProducesResponseType(typeof(Response), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [HttpPost]
    public async Task<ActionResult<Response>> Create(CreateRequest createRequest)
    {
        var result = await _eventService.CreateAsync(createRequest);
        return CreatedAtAction(
            nameof(GetById),
            new { Id = result.Id },
            result);
    }

    [HttpGet]
    public async Task<ActionResult<List<Response>>> GetAll(bool includeUnactivated = false)
    {
        var result = await _eventService.GetAllAsync(includeUnactivated);
        return Ok(result);
    }

    [HttpGet("{eventId:guid}")]
    public async Task<ActionResult<Response?>> GetById(Guid eventId)
    {
        var result = await _eventService.GetByIdAsync(eventId);
        return Ok(result);
    }

    [HttpPut("{eventId:guid}")]
    public async Task<ActionResult<Response?>> Update(Guid eventId,UpdateRequest request)
    {
        request.Id = eventId;
        var result = await _eventService.UpdateAsync(request);
        return Ok(result);
    }

    [HttpPatch("{eventId:guid}/publish")]
    public async Task<ActionResult<Response?>> Publish(Guid eventId)
    {
        var result = await _eventService.PublishAsync(eventId);
        return Ok(result);
    }

    [HttpPatch("{eventId:guid}/unpublish")]
    public async Task<ActionResult<Response?>> Unpublish(Guid eventId)
    {
        var result = await _eventService.UnpublishAsync(eventId);
        return Ok(result);
    }

    [HttpDelete]
    public async Task<ActionResult<bool>> Archive(Guid eventId)
    {
        var result = await _eventService.ArchiveAsync(eventId);
        return Ok(result);
    }



}