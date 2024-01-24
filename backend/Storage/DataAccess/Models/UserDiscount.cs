namespace DataAccess.Models
{
  public class UserDiscount
  {
    public int Id { get; set; }
    public string UserId { get; set; }
    public double DiscountMultiplier { get; set; }
    public ApplicationUser User { get; set; }
  }
}
