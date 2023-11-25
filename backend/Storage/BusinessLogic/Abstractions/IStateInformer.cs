using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessLogic.Models.Api.State;

namespace BusinessLogic.Abstractions
{
  public interface IStateInformer
  {
    Task ProductsCountChangedAsync(IEnumerable<ApiProdCountChange> changes, int revision );

    Task OrderChangedAsync(IEnumerable<ApiOrderDetailsChange> changes, int revision);
  }
}
