using System.ComponentModel.DataAnnotations;

namespace Announcement_and_Event_Track_App.Dtos.Announcement;

using Announcement_and_Event_Track_App.Entitys.Enums;

public class CreateRequest
{
    [Required, MinLength(5), MaxLength(100)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(500)] 
    public string Content { get; set; } = string.Empty;
    
    [Required]
    public Guid CategoryId { get; set; }
}