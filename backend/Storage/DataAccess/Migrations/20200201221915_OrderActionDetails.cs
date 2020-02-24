using Microsoft.EntityFrameworkCore.Migrations;

namespace DataAccess.Migrations
{
    public partial class OrderActionDetails : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Operation",
                table: "OrderAction",
                nullable: true,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "OrderJson",
                table: "OrderAction",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Operation",
                table: "OrderAction");

            migrationBuilder.DropColumn(
                name: "OrderJson",
                table: "OrderAction");
        }
    }
}
