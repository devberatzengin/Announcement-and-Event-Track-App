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
    public Task<List<Response>> GetAllAsync(bool includeUnactivated = false)
    {
        return _announcementService.GetAllAsync(includeUnactivated);
    }

    //  New Announcement
    [HttpPost]
    public Task<Response> CreateAsync(CreateRequest request)
    {
        return _announcementService.CreateAsync(request);
    }

    // Get Announcement By Id
    [HttpGet("{id}")]
    public Task<Response?> GetByIdAsync(Guid id)
    {
        return _announcementService.GetByIdAsync(id);
    }
    
    
    // [HttpPut] Edit Announcement By Id
    [HttpPut("{id}")]
    public Task<Response?> UpdateAsync(Guid id,UpdateRequest request)
    {
        request.Id = id; // burda ne yaptım bilmiyorum bi an mantığıma yatmadı
        return _announcementService.UpdateAsync(request);
    }

    // Announcement Publish By Id
    [HttpPatch("{id}/publish")]
    public Task<Response?> PublishAsync(Guid id)
    {
        return _announcementService.PublishAsync(id);
    }

    //Announcement UnPublish By Id
    [HttpPatch("{id}/unpublish")]
    public Task<Response?> UnpublishAsync(Guid id)
    {
        return _announcementService.UnpublishAsync(id);
    }

    [HttpPatch("{id}/archive")] // arşivleme silme gibi şuan elle açmadıkça arşivde duruyor şuan
    public Task<bool> ArchiveAsync(Guid id)
    {
        return _announcementService.ArchiveAsync(id);
    }

}