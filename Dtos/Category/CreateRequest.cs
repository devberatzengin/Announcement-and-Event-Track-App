using System.ComponentModel.DataAnnotations;

namespace Announcement_and_Event_Track_App.Dtos.Category;


using Announcement_and_Event_Track_App.Entitys.Enums;

public class CreateRequest
{
    [Required, MinLength(3), MaxLength(20)]
    public string Name { get; set; } =  string.Empty;
    
    [Required]
    public CategoryType Type { get; set;} = CategoryType.Undefined;
}