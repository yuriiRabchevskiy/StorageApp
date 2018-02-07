using System;
using System.Collections.Generic;

namespace DataAccess.Models
{

  public enum OperationDescription { TransferAdd, TransferRemove, Sold, StockRenew, Delete }

  public class ProductAction
  {
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int? OrderId { get; set; }
    public string UserId { get; set; }
    public int WerehouseId { get; set; }

    public DateTime Date { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
    public double BuyPrice { get; set; }
    public string Description { get; set; }

    public OperationDescription Operation { get; set; }

    public Product Product { get; set; }
    public Order Order { get; set; }
    public Warehouse Warehouse { get; set; }
    public ApplicationUser User { get; set; }
  }
}
