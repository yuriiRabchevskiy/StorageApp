using DataAccess.Models;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
  /// <inheritdoc />
  public partial class AppStateSnapshot : Migration
  {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.CreateTable(
          name: "AppState",
          columns: table => new
          {
            Id = table.Column<int>(type: "int", nullable: false)
                  .Annotation("SqlServer:Identity", "1, 1"),
            ProductsRevision = table.Column<int>(type: "int", nullable: false),
            OrdersRevision = table.Column<int>(type: "int", nullable: false)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_AppState", x => x.Id);
          });

      migrationBuilder.InsertData(nameof(ApplicationDbContext.AppState),
        columns: new[]
        { nameof(ApplicationState.OrdersRevision), nameof(ApplicationState.ProductsRevision)
        },
        values: new object[,]
        {
          {1, 1}
        });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropTable(
          name: "AppState");
    }
  }
}
