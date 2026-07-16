using Announcement_and_Event_Track_App.Entitys.Enums;

namespace Announcement_and_Event_Track_App.Dtos.Auth;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserType Type { get; set; } = UserType.User;    
}