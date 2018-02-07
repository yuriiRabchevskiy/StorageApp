using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace DataAccess.Migrations
{
    public partial class CancelOrder : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductsTrqansactions_Orders_OrderId",
                table: "ProductsTrqansactions");

            migrationBuilder.AlterColumn<int>(
                name: "OrderId",
                table: "ProductsTrqansactions",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<int>(
                name: "OrderNumber",
                table: "Orders",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddColumn<string>(
                name: "CancelReason",
                table: "Orders",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CanceledByUserId",
                table: "Orders",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CanceledDate",
                table: "Orders",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_CanceledByUserId",
                table: "Orders",
                column: "CanceledByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_CanceledByUserId",
                table: "Orders",
                column: "CanceledByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

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
                name: "FK_Orders_AspNetUsers_CanceledByUserId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductsTrqansactions_Orders_OrderId",
                table: "ProductsTrqansactions");

            migrationBuilder.DropIndex(
                name: "IX_Orders_CanceledByUserId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CancelReason",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CanceledByUserId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CanceledDate",
                table: "Orders");

            migrationBuilder.AlterColumn<int>(
                name: "OrderId",
                table: "ProductsTrqansactions",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "OrderNumber",
                table: "Orders",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductsTrqansactions_Orders_OrderId",
                table: "ProductsTrqansactions",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
