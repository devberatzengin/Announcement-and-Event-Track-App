namespace Announcement_and_Event_Track_App.Entitys;

using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;


[Table("Event")]
public class Event
{
    [Key]
    [Required]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string Name { get; set; }  = string.Empty;
    
    public string Description { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;
    
    [Required]
    public DateTime StartDate { get; set; } = DateTime.Today;
    
    [Required]
    public DateTime EndDate { get; set; } = DateTime.Today;
    
    [Required]
    public Guid CategoryId { get; set; }
    
    [Required]
    public Category Category { get; set; }
    
    
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    
}