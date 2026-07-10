using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Announcement_and_Event_Track_App.Migrations
{
    /// <inheritdoc />
    public partial class FixEventCategoryRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "category_id",
                table: "Event",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "category_id",
                table: "Announcement",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Event_category_id",
                table: "Event",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_Announcement_category_id",
                table: "Announcement",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name",
                table: "Categories",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Announcement_Categories_category_id",
                table: "Announcement",
                column: "category_id",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Event_Categories_category_id",
                table: "Event",
                column: "category_id",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Announcement_Categories_category_id",
                table: "Announcement");

            migrationBuilder.DropForeignKey(
                name: "FK_Event_Categories_category_id",
                table: "Event");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Event_category_id",
                table: "Event");

            migrationBuilder.DropIndex(
                name: "IX_Announcement_category_id",
                table: "Announcement");

            migrationBuilder.DropColumn(
                name: "category_id",
                table: "Event");

            migrationBuilder.DropColumn(
                name: "category_id",
                table: "Announcement");
        }
    }
}
