using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Announcement_and_Event_Track_App.Entitys;


[Table("Announcement")]
public class Announcement
{

    [Key] // Primary Key
    [DatabaseGenerated(DatabaseGeneratedOption.None)] // Uuid Db'de üretilmez
    [Required] // Not Null
    public Guid Id { get; set; }  = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)] // varchar(100)
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)] // varchar(500)
    public String Content { get; set; } = string.Empty;
    
    
    
    [Required]
    [Column("created_by_user_id")]
    public Guid CreatedByUserId { get; set; } 
    
    [ForeignKey(nameof(CreatedByUserId))]
    public User CreatedBy { get; set; } = null!;
    
    [Column("category_id")]
    public Guid CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; set; } = null!;

    
    
    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

}   