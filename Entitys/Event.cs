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
    public string Name { get; set; }  = "Event Default Name";
    
    public string Description { get; set; } = "Event Description";
    
    public string Location { get; set; } = "Event Location";
    
    [Required]
    public DateTime StartDate { get; set; } = DateTime.Today;
    
    [Required]
    public DateTime EndDate { get; set; } = DateTime.Today;
    
    [Required]
    [Column("category_id")]
    public Guid CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; set; } = null!;
    
    
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    
}