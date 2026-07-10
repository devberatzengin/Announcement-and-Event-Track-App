using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Announcement_and_Event_Track_App.Entitys;


[Table("Announcement")]
public class Announcement
{

    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    [Required]
    [Column("id")]
    public Guid Id { get; set; }  = Guid.NewGuid();
    
    [Required(ErrorMessage =  "Title is required")]
    [MaxLength(100)]
    [MinLength(5)]
    public String Title { get; set; } = String.Empty;

    [MaxLength(500, ErrorMessage = "Description is too long")]
    public String Content { get; set; } = String.Empty;
    
    //[Required(ErrorMessage ="Announcement could be created by someone")]
    //public User createdBy { get; set; }
    
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