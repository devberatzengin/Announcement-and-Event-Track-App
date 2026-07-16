using System.Formats.Asn1;
using Microsoft.AspNetCore.Mvc;
using Announcement_and_Event_Track_App.Dtos.Announcement;
using Announcement_and_Event_Track_App.Services.Interfaces;

namespace Announcement_and_Event_Track_App.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnnouncementController : ControllerBase
{
    private readonly IAnnouncementService _announcementService;

    public AnnouncementController(IAnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }
    
    
    
    // List All Announcement
    [HttpGet]
    public async Task<ActionResult<List<Response>>> GetAll(bool includeUnactivated = false)
    {
        var result = await _announcementService.GetAllAsync(includeUnactivated);
        return Ok(result);
    }

    //  New Announcement
    [ProducesResponseType(typeof(Response), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [HttpPost]
    public async Task<ActionResult<Response>> Create(CreateRequest request)
    {
        var reuslt = await _announcementService.CreateAsync(request);
        return CreatedAtAction(
            nameof(GetById),
            new { id = reuslt.Id },
            reuslt);
    }

    // Get Announcement By Id
    [HttpGet("{id}")]
    public async Task<ActionResult<Response?>> GetById(Guid id)
    {
        var result = await _announcementService.GetByIdAsync(id);
        return Ok(result);
    }
    
    
    // [HttpPut] Edit Announcement By Id
    [HttpPut("{id}")]
    public async Task<ActionResult<Response?>> Update(Guid id,UpdateRequest request)
    {
        request.Id = id; // burda ne yaptım bilmiyorum bi an mantığıma yatmadı
        var result = await _announcementService.UpdateAsync(request);
        return Ok(result);
    }

    // Announcement Publish By Id
    [HttpPatch("{id}/publish")]
    public async Task<ActionResult<Response?>> Publish(Guid id)
    {
        var result = _announcementService.PublishAsync(id);
        return Ok(result);
    }

    //Announcement UnPublish By Id
    [HttpPatch("{id}/unpublish")]
    public async Task<ActionResult<Response?>> Unpublish(Guid id)
    {
        var result = await _announcementService.UnpublishAsync(id);
        return Ok(result);
    }

    [HttpPatch("{id}/archive")] // arşivleme silme gibi şuan elle açmadıkça arşivde duruyor şuan
    public async Task<ActionResult<bool>> Archive(Guid id)
    {
        var result = await _announcementService.ArchiveAsync(id);
        return Ok(result);
    }

}