using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLogic.Models.Api
{
  public class ApiProdOrder
  {
    public ApiProduct Product { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
    public double BuyPrice { get; set; }
    public double TotalPrice { get; set; }

    public double DiscountMultiplier { get; set; }

    public int WarehouseId { get; set; }
  }
}
