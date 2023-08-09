using DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Models.Api
{
  public class ApiOrderMoveToDeliveredCommand : ApiOrderMoveCommand
  {
    public ApiOrderMoveToDeliveredCommand()
    {
      OrderStatus = OrderStatus.Delivered;
    }
  }
}
