namespace BusinessLogic.Models.Api
{
  public class ApiSale
  {
    public string Category { get; set; }
    public int Quantity { get; set; }
    public double? Sales { get; set; }

    public double? Discount { get; set; }
    public double? BuyPrice { get; set; }
    public double? Profit => Sales - BuyPrice;
  }

  public class ApiSalePerUser : ApiSale
  {
    public int OrdersCount { get; set; }
  }

  public class ApiOrdersOverview : ApiSalePerUser
  {
    public int ClosedCount { get; set; }
    public int CanceledCount { get; set; }
    public int OpenCount { get; set; }
    public double? OpenPrice { get; set; }

    public double? OpenDiscount { get; set; }
    public double? ClosedPrice { get; set; }

    public double? CloseDiscount { get; set; }
    public double? CanceledPrice { get; set; }

  }
}
