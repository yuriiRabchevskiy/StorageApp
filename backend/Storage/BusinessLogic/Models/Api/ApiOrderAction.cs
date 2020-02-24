using System;
using DataAccess.Models;

namespace BusinessLogic.Models.Api
{
  public class ApiOrderAction
  {
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string User { get; set; }
    public DateTime Date { get; set; }
    public string Note { get; set; }
    public string OrderJson { get; set; }

    public OrderOperation? Operation { get; set; }
  }
}
