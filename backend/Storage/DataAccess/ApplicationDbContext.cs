using DataAccess.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;

namespace DataAccess
{
  public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
  {
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
    }

    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<ProductAction> ProductsTrqansactions { get; set; }
    public DbSet<Warehouse> Warehouses { get; set; }
    public DbSet<WarehouseProducts> WarehouseProducts { get; set; }
    public DbSet<Preference> UserPreferences { get; set; }
    public DbSet<OrderAction> OrderAction { get; set; }
    
  }
}
