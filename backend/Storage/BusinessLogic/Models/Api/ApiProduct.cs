using System.Collections.Generic;
using DataAccess.Models;

namespace BusinessLogic.Models.Api
{
  public class ApiProduct
  {
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string ProductCode { get; set; }
    public string ProductType { get; set; } // e.g. backpack, stairs
    public string Model { get; set; } // e.g. backpack, stairs
    public string Producer { get; set; }
    public string Color { get; set; }
    public string Size { get; set; }
    public string FreeNote { get; set; }
    public double RecommendedBuyPrice { get; set; }
    public double RecommendedSalePrice { get; set; }

    public Availability ZeroAvailabilityMarker { get; set; }
    public bool IsActive { get; set; }

    public Dictionary<string, int> Balance { get; set; }
  }

  public class CsvProduct
  {
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string ProductType { get; set; } // e.g. backpack, stairs
    public string Model { get; set; } // e.g. backpack, stairs
    public string Producer { get; set; }
    public string Color { get; set; }
    public string Size { get; set; }
    public string FreeNote { get; set; }
    public bool IsActive { get; set; }
    public int TotalBalance { get; set; }

    public double Price { get; set; }

    public string ProductCode { get; set; }
  }
}
