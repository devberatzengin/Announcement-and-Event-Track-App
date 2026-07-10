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
    [Column("name")]
    public string Name { get; set; }  = "Event Default Name";
    
    [Required(ErrorMessage = "Description is required")]
    [Column("description")]
    public string Description { get; set; } = "Event Description";
    
    [Required(ErrorMessage = "Location is required")]
    [Column("location")]
    public string Location { get; set; } = "Event Location";
    
    [Required(ErrorMessage = "Start date is required")]
    [Column("start_date")]
    public DateTime StartDate { get; set; } = DateTime.Today;
    
    [Column("end_date")]
    public DateTime EndDate { get; set; } = DateTime.Today;
    
    [Required]
    [Column("category_id")]
    public Guid CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; set; } = null!;
    
    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    [Column("created")]
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    
}