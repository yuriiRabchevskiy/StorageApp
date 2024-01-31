namespace BusinessLogic.Models.Api.Client
{
  public class ApiClientProdOrder
  {
    public ApiProduct Product { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
    public double DiscountMultiplier { get; set; }
    public double TotalPrice { get; set; }

  }
}
