using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    public partial class OrderNumberAsString : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TrackingNumber",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "OrderAction",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Operation",
                table: "OrderAction",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_OrderAction_UserId",
                table: "OrderAction",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderAction_AspNetUsers_UserId",
                table: "OrderAction",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderAction_AspNetUsers_UserId",
                table: "OrderAction");

            migrationBuilder.DropIndex(
                name: "IX_OrderAction_UserId",
                table: "OrderAction");

            migrationBuilder.DropColumn(
                name: "TrackingNumber",
                table: "Orders");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "OrderAction",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Operation",
                table: "OrderAction",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
