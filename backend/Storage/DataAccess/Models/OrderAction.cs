using System;

namespace DataAccess.Models
{
  public class OrderAction
  {
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string UserId { get; set; }
    public DateTime Date { get; set; }
    public string Note { get; set; }
  }
}
