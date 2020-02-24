using System;

namespace DataAccess.Models
{

  public enum OrderOperation { Created, Updated, Closed, Canceled }
  public class OrderAction
  {
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string UserId { get; set; }
    public DateTime Date { get; set; }
    public string Note { get; set; }
    public OrderOperation? Operation { get; set; }
    public string OrderJson { get; set; }

    public ApplicationUser User { get; set; }

  }
}
