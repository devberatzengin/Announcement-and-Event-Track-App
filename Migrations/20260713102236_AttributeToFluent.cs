using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Announcement_and_Event_Track_App.Migrations
{
    /// <inheritdoc />
    public partial class AttributeToFluent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            
            
            migrationBuilder.DropForeignKey(
                name: "FK_Announcement_Categories_category_id",
                table: "Announcement");

            migrationBuilder.DropForeignKey(
                name: "FK_Announcement_Users_created_by_user_id",
                table: "Announcement");

            migrationBuilder.DropForeignKey(
                name: "FK_Event_Categories_category_id",
                table: "Event");

            migrationBuilder.DropIndex(
                name: "IX_Announcement_category_id",
                table: "Announcement");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Event",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "location",
                table: "Event",
                newName: "Location");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "Event",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "start_date",
                table: "Event",
                newName: "StartDate");

            migrationBuilder.RenameColumn(
                name: "is_deleted",
                table: "Event",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "Event",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "end_date",
                table: "Event",
                newName: "EndDate");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Event",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "created",
                table: "Event",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "category_id",
                table: "Event",
                newName: "CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Event_category_id",
                table: "Event",
                newName: "IX_Event_CategoryId");

            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "Categories",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Announcement",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "created_by_user_id",
                table: "Announcement",
                newName: "CreatedByUserId");

            migrationBuilder.RenameColumn(
                name: "category_id",
                table: "Announcement",
                newName: "CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Announcement_created_by_user_id",
                table: "Announcement",
                newName: "IX_Announcement_CreatedByUserId");

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "Users",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Categories",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
            
            migrationBuilder.Sql("""
                                 UPDATE "Categories" SET "Type" = CASE "Type"
                                     WHEN '0' THEN 'Undefined' WHEN '1' THEN 'Draft'
                                     WHEN '2' THEN 'Published' WHEN '3' THEN 'Unpublished'
                                     WHEN '4' THEN 'Archived' ELSE "Type" END;
            """);

            

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Categories",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Categories",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Categories",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Event_StartDate",
                table: "Event",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_Announcement_CategoryId_is_active",
                table: "Announcement",
                columns: new[] { "CategoryId", "is_active" });

            migrationBuilder.AddForeignKey(
                name: "FK_Announcement_Categories_CategoryId",
                table: "Announcement",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Announcement_Users_CreatedByUserId",
                table: "Announcement",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Event_Categories_CategoryId",
                table: "Event",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Announcement_Categories_CategoryId",
                table: "Announcement");

            migrationBuilder.DropForeignKey(
                name: "FK_Announcement_Users_CreatedByUserId",
                table: "Announcement");

            migrationBuilder.DropForeignKey(
                name: "FK_Event_Categories_CategoryId",
                table: "Event");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Event_StartDate",
                table: "Event");

            migrationBuilder.DropIndex(
                name: "IX_Announcement_CategoryId_is_active",
                table: "Announcement");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Categories");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Event",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Location",
                table: "Event",
                newName: "location");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Event",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Event",
                newName: "created");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "Event",
                newName: "start_date");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Event",
                newName: "is_deleted");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "Event",
                newName: "is_active");

            migrationBuilder.RenameColumn(
                name: "EndDate",
                table: "Event",
                newName: "end_date");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Event",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Event",
                newName: "category_id");

            migrationBuilder.RenameIndex(
                name: "IX_Event_CategoryId",
                table: "Event",
                newName: "IX_Event_category_id");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "Categories",
                newName: "is_active");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Announcement",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "CreatedByUserId",
                table: "Announcement",
                newName: "created_by_user_id");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Announcement",
                newName: "category_id");

            migrationBuilder.RenameIndex(
                name: "IX_Announcement_CreatedByUserId",
                table: "Announcement",
                newName: "IX_Announcement_created_by_user_id");

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "Users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "Categories",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.CreateIndex(
                name: "IX_Announcement_category_id",
                table: "Announcement",
                column: "category_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Announcement_Categories_category_id",
                table: "Announcement",
                column: "category_id",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Announcement_Users_created_by_user_id",
                table: "Announcement",
                column: "created_by_user_id",
                principalTable: "Users",
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
    }
}
