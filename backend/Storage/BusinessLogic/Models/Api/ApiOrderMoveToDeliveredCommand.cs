using DataAccess.Models;

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
