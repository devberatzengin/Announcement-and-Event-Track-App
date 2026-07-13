namespace Announcement_and_Event_Track_App.Dtos.Announcement;

public class Response
{
    public Guid Id { get; set; } 
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    
    public string CreatedByName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;  
        
    public Guid CategoryId { get; set; }
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}