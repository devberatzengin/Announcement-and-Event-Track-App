using Announcement_and_Event_Track_App.Entitys;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Announcement_and_Event_Track_App.Data.Configurations;

public class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
{
    public void Configure(EntityTypeBuilder<Announcement> builder)
    {
        // Key
        builder.HasKey(x => x.Id); 
        builder.Property(x => x.Id)
            .ValueGeneratedNever();
        
        // Her duyurunun 1 tane Categorisi vardır ilişkisi
        
        builder.HasOne(a => a.Category)
            .WithMany()
            .HasForeignKey(a => a.CategoryId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict); // içinde duyuru varsa kategori silinemez.
        
        // Her duyurunun 1 user ilişkisi (createdBy) vardır
        
        builder.HasOne(a => a.CreatedBy)
            .WithMany()
            .HasForeignKey(a => a.CreatedByUserId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
        
        // ---- Index: en sık sorgu "kategorideki aktif duyurular" ----
        builder.HasIndex(a => new { a.CategoryId, a.IsActive });

        // Is deleted true gelmesin ekrana
        builder.HasQueryFilter(x => !x.IsDeleted);
        
        
    }
}