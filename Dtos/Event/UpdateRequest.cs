using System.ComponentModel.DataAnnotations;

namespace Announcement_and_Event_Track_App.Dtos.Event;

public class UpdateRequest
{
    [Required(ErrorMessage = "Event cant update witout id")]
    public Guid Id { get; set; }
    
    public string Name { get; set; }  = "Event Default Name";
    
    public string Description { get; set; } = "Event Description";
    
    public string Location { get; set; } = "Event Location";
    
    public DateTime StartDate { get; set; }
    
    public DateTime EndDate { get; set; }
    
    public Guid CategoryId { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public bool IsDeleted { get; set; } = false;
}