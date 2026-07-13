using Announcement_and_Event_Track_App.Entitys;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Announcement_and_Event_Track_App.Data.Configurations;

public class EventConfiguration : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.HasOne(e => e.Category)
            .WithMany(c => c.Events)
            .HasForeignKey(e => e.CategoryId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        // Yaklaşan event'ler index'i 
        builder.HasIndex(e => e.StartDate);

        
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}