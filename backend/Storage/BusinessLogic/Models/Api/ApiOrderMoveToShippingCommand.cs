using DataAccess.Models;

namespace BusinessLogic.Models.Api
{
  public class ApiOrderMoveToShippingCommand : ApiOrderMoveCommand
  {
    public ApiOrderMoveToShippingCommand()
    {
      OrderStatus = OrderStatus.Shipping;
    }
  }
}
