using DataAccess.Models;
using System.Collections.Generic;

namespace BusinessLogic.Models.Api
{
  public class ApiOrderMoveToProcessingCommand: ApiOrderMoveCommand
  {
    public ApiOrderMoveToProcessingCommand()
    {
      OrderStatus = OrderStatus.Processing;
    }
  }
}
