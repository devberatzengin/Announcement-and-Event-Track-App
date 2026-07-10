using Announcement_and_Event_Track_App.Entitys;
using Announcement_and_Event_Track_App.Entitys.Enums;

namespace Announcement_and_Event_Track_App.Dtos;


public static class AnnouncementDtos
{
    public class UpdateRequest
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
    
    public class CreateRequest
    {
        public String Title { get; set; } = String.Empty;
        public String Content { get; set; } = String.Empty;
        public CategoryType CategoryType { get; set; }
        
    }
    
    public class AnnouncementResponse
    {
        public Guid Id { get; set; } 
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;  
        
        public Guid CategoryId { get; set; }
        public bool IsActive { get; set; } = true;
    
        public DateTime DateCreated { get; set; }
        public DateTime DateUpdated { get; set; }
        
    }
}