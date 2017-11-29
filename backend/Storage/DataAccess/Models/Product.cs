
namespace DataAccess.Models
{
  public class Product
  {
    public int Id { get; set; }
    public string Name { get; set; }
    public string Color { get; set; }
    public string Size { get; set; }
    public string FreeNote { get; set; }
    public double RecommendedBuyPrice { get; set; }
    public double RecommendedSalePrice { get; set; }
  }
}
