using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;

namespace DataAccess
{
  public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
  {
    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<ProductAction> ProductsTrqansactions { get; set; }
    public DbSet<Warehouse> Warehouses { get; set; }
    public DbSet<WarehouseProducts> WarehouseProducts { get; set; }
    public DbSet<Preference> UserPreferences { get; set; }
    public DbSet<OrderAction> OrderAction { get; set; }
    public DbSet<ApplicationState> AppState { get; set; }
    public DbSet<UserDiscount> UserDiscounts { get; set; }

    public DbSet<ProductCountChange> ProductCountChanges { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
      base.OnModelCreating(builder);
      // Customize the ASP.NET Identity model and override the defaults if needed.
      // For example, you can rename the ASP.NET Identity table names and more.
      // Add your customizations after calling base.OnModelCreating(builder);
      builder.Entity<OrderAction>()
        .Property(x => x.Date)
        .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

      builder.Entity<ProductAction>()
        .Property(x => x.Date)
        .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

      builder.Entity<Order>()
        .Property(x => x.OpenDate)
        .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

      builder.Entity<Order>()
        .Property(x => x.CanceledDate)
        .HasConversion(v => v, v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null);

      builder.Entity<Order>()
        .Property(x => x.CloseDate)
        .HasConversion(v => v, v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null);

      builder.Entity<IdentityRole>().HasData(new IdentityRole[] {
                new IdentityRole{
                  Id = "1dff4f55-bb77-45b3-855b-cbf07956e542" ,
                  ConcurrencyStamp = "dab90e8f-f5b3-4636-8fc1-a235144e3108",
                  Name="Admin",
                  NormalizedName="ADMIN"},
                new IdentityRole{
                  Id = "674f258a-3bdc-481a-b542-88918aa0cc70" ,
                  ConcurrencyStamp = "46cb7bbf-9a18-4471-b145-f761452d6b2d",
                  Name="Client",
                  NormalizedName="CLIENT"},
                new IdentityRole{
                  Id = "6c31ac53-8b84-468c-84bc-62d5b7650ab9" ,
                  ConcurrencyStamp = "8899bd73-3c61-4fe0-bd56-4d0f24ff1478",
                  Name="User",
                  NormalizedName="USER"},
                new IdentityRole{
                  Id = "c5783af5-1b7b-4fb7-afcc-3dceca0d0bf6" ,
                  ConcurrencyStamp = "3f2ad95e-e15e-4f06-ad86-f861031d19b3",
                  Name="AdminAssistant",
                  NormalizedName="ADMINASSISTANT"},
                new IdentityRole{
                  Id = "d106ab57-e203-43cd-a72f-405308541a19" ,
                  ConcurrencyStamp = "4013c147-877b-48d5-ab0d-469012e9fd1f",
                  Name="WarehouseManager",
                  NormalizedName="WAREHOUSEMANAGER"},
            });
    }

    


  }
}
