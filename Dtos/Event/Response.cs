namespace Announcement_and_Event_Track_App.Dtos.Event;

public class Response
{
    public Guid Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    public Guid CategoryId { get; set; }
    
    
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.Now; //UTc Now olmalıydı
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}