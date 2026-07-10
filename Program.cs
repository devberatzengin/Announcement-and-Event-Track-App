using Announcement_and_Event_Track_App.Data;
using Announcement_and_Event_Track_App.Services;
using Announcement_and_Event_Track_App.Services.Impl;
using Microsoft.EntityFrameworkCore;

namespace Announcement_and_Event_Track_App;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddOpenApi();
        
        // Db Connections
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
    
        // Services
        builder.Services.AddScoped<IAnnouncementService,AnnouncementService>();
        
        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();

        app.UseAuthorization();
        
        app.MapControllers();

        app.Run();
    }
}