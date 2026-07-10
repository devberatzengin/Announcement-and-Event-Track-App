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
    public String Username { get; set; } = String.Empty;
    
    [Required(ErrorMessage = "Password is required")]
    public String Password { get; set; } = String.Empty;
    
    [Required(ErrorMessage =  "Email is required")]
    public String Email { get; set; } = String.Empty;
    
    [Required(ErrorMessage = "Confirm Password is required")]
    [MaxLength(20),MinLength(2)]
    public String FirstName { get; set; } = String.Empty;
    
    public String LastName { get; set; } = String.Empty;
    
    public String PhoneNumber { get; set; } = String.Empty;
}