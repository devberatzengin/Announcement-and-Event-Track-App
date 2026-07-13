using Announcement_and_Event_Track_App.Entitys;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Announcement_and_Event_Track_App.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {

        
        builder.Property(u => u.Type)
            .HasConversion<string>()
            .IsRequired();
        
        builder.HasIndex(e => e.Email).IsUnique();

        builder.HasQueryFilter(u => !u.IsDeleted);
    }
}