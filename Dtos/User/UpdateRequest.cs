namespace Announcement_and_Event_Track_App.Dtos.User;

public class UpdateRequest
{
    public string Username { get; set; } = string.Empty;
    
    public string Password { get; set; } = string.Empty;
    
    public string Email { get; set; } = string.Empty;
    // Adı soyadınıda değiştirmesin ya
    public string PhoneNumber { get; set; } = string.Empty;
}