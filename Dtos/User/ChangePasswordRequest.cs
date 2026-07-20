namespace Announcement_and_Event_Track_App.Dtos.User;

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    
    public string NewPassword { get; set; } = string.Empty;
}