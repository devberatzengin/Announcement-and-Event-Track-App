using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Announcement_and_Event_Track_App.Migrations
{
    /// <inheritdoc />
    public partial class EventCreated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "isDeleted",
                table: "Announcement",
                newName: "is_deleted");

            migrationBuilder.RenameColumn(
                name: "isActive",
                table: "Announcement",
                newName: "is_active");

            migrationBuilder.RenameColumn(
                name: "DateUpdated",
                table: "Announcement",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "DateCreated",
                table: "Announcement",
                newName: "created");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "is_deleted",
                table: "Announcement",
                newName: "isDeleted");

            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "Announcement",
                newName: "isActive");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Announcement",
                newName: "DateUpdated");

            migrationBuilder.RenameColumn(
                name: "created",
                table: "Announcement",
                newName: "DateCreated");
        }
    }
}
