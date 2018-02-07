using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace DataAccess.Migrations
{
    public partial class CreateProductWarehouse : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductBalance_Products_ProductId",
                table: "ProductBalance");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductBalance",
                table: "ProductBalance");

            migrationBuilder.RenameTable(
                name: "ProductBalance",
                newName: "ProductsBalance");

            migrationBuilder.RenameIndex(
                name: "IX_ProductBalance_ProductId",
                table: "ProductsBalance",
                newName: "IX_ProductsBalance_ProductId");

            migrationBuilder.AddColumn<int>(
                name: "WarehouseId",
                table: "Products",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "ProductsBalance",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdWerehouse",
                table: "ProductsBalance",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SysDescription",
                table: "ProductsBalance",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarehouseId",
                table: "ProductsBalance",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductsBalance",
                table: "ProductsBalance",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "UserPreferences",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Key = table.Column<string>(nullable: true),
                    UserId = table.Column<string>(nullable: true),
                    Value = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPreferences", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Email = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    Notes = table.Column<string>(nullable: true),
                    Phone = table.Column<string>(nullable: true),
                    Surname = table.Column<string>(nullable: true),
                    UserId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WarehouseProducts",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ProductId = table.Column<int>(nullable: false),
                    Quantity = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarehouseProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarehouseProducts_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Warehouses",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Address = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warehouses", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_WarehouseId",
                table: "Products",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductsBalance_WarehouseId",
                table: "ProductsBalance",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseProducts_ProductId",
                table: "WarehouseProducts",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Warehouses_WarehouseId",
                table: "Products",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductsBalance_Products_ProductId",
                table: "ProductsBalance",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductsBalance_Warehouses_WarehouseId",
                table: "ProductsBalance",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Warehouses_WarehouseId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductsBalance_Products_ProductId",
                table: "ProductsBalance");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductsBalance_Warehouses_WarehouseId",
                table: "ProductsBalance");

            migrationBuilder.DropTable(
                name: "UserPreferences");

            migrationBuilder.DropTable(
                name: "UserProfiles");

            migrationBuilder.DropTable(
                name: "WarehouseProducts");

            migrationBuilder.DropTable(
                name: "Warehouses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductsBalance",
                table: "ProductsBalance");

            migrationBuilder.DropIndex(
                name: "IX_ProductsBalance_WarehouseId",
                table: "ProductsBalance");

            migrationBuilder.DropIndex(
                name: "IX_Products_WarehouseId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "ProductsBalance");

            migrationBuilder.DropColumn(
                name: "IdWerehouse",
                table: "ProductsBalance");

            migrationBuilder.DropColumn(
                name: "SysDescription",
                table: "ProductsBalance");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "ProductsBalance");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "Products");

            migrationBuilder.RenameTable(
                name: "ProductsBalance",
                newName: "ProductBalance");

            migrationBuilder.RenameIndex(
                name: "IX_ProductsBalance_ProductId",
                table: "ProductBalance",
                newName: "IX_ProductBalance_ProductId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductBalance",
                table: "ProductBalance",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductBalance_Products_ProductId",
                table: "ProductBalance",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
