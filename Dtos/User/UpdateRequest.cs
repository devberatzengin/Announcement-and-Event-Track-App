using System.ComponentModel.DataAnnotations;

namespace Announcement_and_Event_Track_App.Dtos.User;

public class UpdateRequest
{
    [Required]
    public string FirstName { get; set; } = string.Empty;
    
    public string LastName { get; set; } = string.Empty;
}