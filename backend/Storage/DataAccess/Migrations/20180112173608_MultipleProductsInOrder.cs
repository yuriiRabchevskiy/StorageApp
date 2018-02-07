using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace DataAccess.Migrations
{
    public partial class MultipleProductsInOrder : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.AddColumn<int>(
                name: "OrderId",
                table: "ProductsTrqansactions",
                nullable: true);

          migrationBuilder.DropForeignKey("FK_Orders_Products_ProductId", table: "Orders");
          migrationBuilder.DropIndex("IX_Orders_ProductId", table: "Orders");

          migrationBuilder.DropColumn("ProductId", table: "Orders");

          migrationBuilder.AddForeignKey(
                name: "FK_ProductsTrqansactions_Orders_OrderId",
                table: "ProductsTrqansactions",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
      migrationBuilder.DropForeignKey(
          name: "FK_ProductsTrqansactions_Orders_OrderId",
          table: "ProductsTrqansactions");

      migrationBuilder.DropColumn(
          name: "OrderId",
          table: "ProductsTrqansactions");

    }
    }
}
