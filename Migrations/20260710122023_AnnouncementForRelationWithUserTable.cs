using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Announcement_and_Event_Track_App.Migrations
{
    /// <inheritdoc />
    public partial class AnnouncementForRelationWithUserTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "created",
                table: "Announcement",
                newName: "updated_at");

            migrationBuilder.AddColumn<Guid>(
                name: "created_by_user_id",
                table: "Announcement",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Announcement_created_by_user_id",
                table: "Announcement",
                column: "created_by_user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Announcement_Users_created_by_user_id",
                table: "Announcement",
                column: "created_by_user_id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Announcement_Users_created_by_user_id",
                table: "Announcement");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Announcement_created_by_user_id",
                table: "Announcement");

            migrationBuilder.DropColumn(
                name: "created_by_user_id",
                table: "Announcement");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Announcement",
                newName: "created");
        }
    }
}
