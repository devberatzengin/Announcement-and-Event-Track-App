using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Announcement_and_Event_Track_App.Entitys;

[Table("Users")]
public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; } =  Guid.NewGuid();
    
    [Required(ErrorMessage = "Username is required")]
    public String Username { get; set; }
    
    [Required(ErrorMessage = "Password is required")]
    public String Password { get; set; }
    
    [Required(ErrorMessage =  "Email is required")]
    public String Email { get; set; }
    
    [Required(ErrorMessage = "Confirm Password is required")]
    [MaxLength(20),MinLength(2)]
    public String FirstName { get; set; }
    
    public String LastName { get; set; }
    
    public String PhoneNumber { get; set; }
}