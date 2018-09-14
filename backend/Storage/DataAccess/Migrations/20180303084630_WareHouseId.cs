using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace DataAccess.Migrations
{
    public partial class WareHouseId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.DropColumn(
                name: "WerehouseId",
                table: "ProductsTrqansactions");

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.AddColumn<int>(
                name: "WerehouseId",
                table: "ProductsTrqansactions",
                nullable: false,
                defaultValue: 1);
        }
    }
}
