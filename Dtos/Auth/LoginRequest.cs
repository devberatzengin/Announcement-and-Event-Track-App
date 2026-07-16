using System.ComponentModel.DataAnnotations;

namespace Announcement_and_Event_Track_App.Dtos.Auth;

public class LoginRequest
{
    [Required]
    public string Email { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    
    [Required]
    public string Password { get; set; } = string.Empty;
}