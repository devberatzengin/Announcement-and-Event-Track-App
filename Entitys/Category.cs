using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Announcement_and_Event_Track_App.Entitys.Enums;
using Microsoft.EntityFrameworkCore;

namespace Announcement_and_Event_Track_App.Entitys;

[Table("Categories")]
[Index(nameof(Name), IsUnique = true)]
public class Category
{
    [Key]
    [Required]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; } = new Guid();
    
    [Required(ErrorMessage = "Name is required")]
    [MaxLength(20), MinLength(3)] 
    public String Name { get; set; } =  string.Empty;
    
    public CategoryType Type { get; set;} = CategoryType.Undefined;
    
    [Column("is_active")]
    public bool IsActive { get; set; } = true;
    
    [JsonIgnore]
    public ICollection<Event> Events { get; set; } = new List<Event>();
    
}