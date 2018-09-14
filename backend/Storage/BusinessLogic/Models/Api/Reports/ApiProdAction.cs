using DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLogic.Models.Api.Reports
{
  public class ApiWarehouseAction
  {
    public int ProductId { get; set; }
    public int? OrderId { get; set; }

    public DateTime Date { get; set; }
    public int Quantity { get; set; }
    //public double Price { get; set; }
    //public double BuyPrice { get; set; }
    public string Description { get; set; }
    public string Operation { get; set; }

    public string Warehouse { get; set; }
    public string User { get; set; }
    public string ProductString { get; set; }
  }
}
