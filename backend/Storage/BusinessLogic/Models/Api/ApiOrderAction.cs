using DataAccess.Models;
using System;
using System.Collections.Generic;

namespace BusinessLogic.Models.Api
{
  public class ApiOrderAction
  {
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string UserId { get; set; }
    public DateTime Date { get; set; }
    public string Note { get; set; }
    public string OrderJson { get; set; }
  }
}
