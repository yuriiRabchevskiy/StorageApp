using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace DataAccess.Migrations
{
    public partial class CreateProductTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Color = table.Column<string>(nullable: true),
                    FreeNote = table.Column<string>(nullable: true),
                    Model = table.Column<string>(nullable: true),
                    Producer = table.Column<string>(nullable: true),
                    ProductType = table.Column<string>(nullable: true),
                    RecommendedBuyPrice = table.Column<double>(nullable: false),
                    RecommendedSalePrice = table.Column<double>(nullable: false),
                    Size = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductBalance",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Date = table.Column<DateTime>(nullable: false),
                    IdProduct = table.Column<int>(nullable: false),
                    IdUser = table.Column<string>(nullable: true),
                    Operation = table.Column<int>(nullable: false),
                    Price = table.Column<double>(nullable: false),
                    ProductId = table.Column<int>(nullable: true),
                    Quantity = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductBalance", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductBalance_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductBalance_ProductId",
                table: "ProductBalance",
                column: "ProductId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductBalance");

            migrationBuilder.DropTable(
                name: "Products");
        }
    }
}
