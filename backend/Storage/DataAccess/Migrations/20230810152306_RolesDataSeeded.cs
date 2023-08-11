using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class RolesDataSeeded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "1dff4f55-bb77-45b3-855b-cbf07956e542", "dab90e8f-f5b3-4636-8fc1-a235144e3108", "Admin", "ADMIN" },
                    { "674f258a-3bdc-481a-b542-88918aa0cc70", "46cb7bbf-9a18-4471-b145-f761452d6b2d", "Client", "CLIENT" },
                    { "6c31ac53-8b84-468c-84bc-62d5b7650ab9", "8899bd73-3c61-4fe0-bd56-4d0f24ff1478", "User", "USER" },
                    { "c5783af5-1b7b-4fb7-afcc-3dceca0d0bf6", "3f2ad95e-e15e-4f06-ad86-f861031d19b3", "AdminAssistant", "ADMINASSISTANT" },
                    { "d106ab57-e203-43cd-a72f-405308541a19", "4013c147-877b-48d5-ab0d-469012e9fd1f", "WarehouseManager", "WAREHOUSEMANAGER" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "1dff4f55-bb77-45b3-855b-cbf07956e542");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "674f258a-3bdc-481a-b542-88918aa0cc70");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "6c31ac53-8b84-468c-84bc-62d5b7650ab9");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "c5783af5-1b7b-4fb7-afcc-3dceca0d0bf6");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "d106ab57-e203-43cd-a72f-405308541a19");
        }
    }
}
