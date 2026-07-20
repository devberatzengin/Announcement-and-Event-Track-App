using Announcement_and_Event_Track_App.Entitys.Enums;

namespace Announcement_and_Event_Track_App.Dtos.User;

public class UserResponse
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserType Type { get; set; } = UserType.User;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt  { get; set; } = DateTime.Now;
}