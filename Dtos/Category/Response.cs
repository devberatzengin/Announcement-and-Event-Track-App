using Announcement_and_Event_Track_App.Entitys;
using Announcement_and_Event_Track_App.Entitys.Enums;

namespace Announcement_and_Event_Track_App.Dtos.Category;

public class Response
{
    public Guid Id { get; set; }
    
    public string Name { get; set; }  = string.Empty;
    
    public CategoryType Type { get; set; }
    
    public bool IsActive { get; set; }
    
}