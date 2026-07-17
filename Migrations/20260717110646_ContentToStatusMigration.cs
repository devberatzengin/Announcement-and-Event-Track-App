using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Announcement_and_Event_Track_App.Migrations
{
    /// <inheritdoc />
    public partial class ContentToStatusMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Event_CategoryId",
                table: "Event");

            migrationBuilder.DropIndex(
                name: "IX_Announcement_CategoryId_is_active",
                table: "Announcement");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Event");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Event");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "Announcement");

            migrationBuilder.DropColumn(
                name: "is_deleted",
                table: "Announcement");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Event",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "Announcement",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Event_CategoryId_Status",
                table: "Event",
                columns: new[] { "CategoryId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Announcement_CategoryId_status",
                table: "Announcement",
                columns: new[] { "CategoryId", "status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Event_CategoryId_Status",
                table: "Event");

            migrationBuilder.DropIndex(
                name: "IX_Announcement_CategoryId_status",
                table: "Announcement");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Event");

            migrationBuilder.DropColumn(
                name: "status",
                table: "Announcement");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Event",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Event",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "Announcement",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_deleted",
                table: "Announcement",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Event_CategoryId",
                table: "Event",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Announcement_CategoryId_is_active",
                table: "Announcement",
                columns: new[] { "CategoryId", "is_active" });
        }
    }
}
