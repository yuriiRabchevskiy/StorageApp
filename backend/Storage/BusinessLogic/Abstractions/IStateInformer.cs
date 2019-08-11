using System.Threading.Tasks;
using BusinessLogic.Models.Api.State;

namespace BusinessLogic.Abstractions
{
  public interface IStateInformer
  {
    Task ProductsCountChangedAsync(ApiProdCountChanges changes);
  }
}
