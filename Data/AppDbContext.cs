using Announcement_and_Event_Track_App.Entitys;
using Microsoft.EntityFrameworkCore;

namespace Announcement_and_Event_Track_App.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        
    }
    
    public DbSet<Announcement> Announcements { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Category> Categories { get; set; }
    
}