
using System.Collections.Generic;

namespace DataAccess.Models
{
  public class Product
  {
    public int Id { get; set; }
    public string ProductCode { get; set; }
    public int? CategoryId { get; set; }
    public string ProductType { get; set; } // e.g. backpack, stairs
    public string Model { get; set; } // e.g. backpack, stairs
    public string Producer { get; set; }
    public string Color { get; set; }
    public string Size { get; set; }
    public string FreeNote { get; set; }
    public double RecommendedBuyPrice { get; set; }
    public double RecommendedSalePrice { get; set; }
    public bool IsActive { get; set; }

    public Category Category { get; set; }
    public ICollection<ProductAction> Transactions { get; set; }
    public ICollection<WarehouseProducts> State { get; set; }
  }
}
