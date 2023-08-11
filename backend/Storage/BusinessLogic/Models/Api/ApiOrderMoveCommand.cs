using DataAccess.Models;
using System;
using System.Collections.Generic;

namespace BusinessLogic.Models.Api
{
  public abstract class ApiOrderMoveCommand
  {
    public List<int> Ids { get; set; }

    public OrderStatus OrderStatus { get; protected set; }
  }
}
