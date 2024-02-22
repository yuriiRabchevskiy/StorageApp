using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAccess;

namespace BusinessLogic.Abstractions
{
  public interface IStateService
  {
    Task<int> UpdateProductsStateCounterAsync(ApplicationDbContext context, ICollection<int> productIds);
    Task<int> UpdateOrdersStateCounterAsync(ApplicationDbContext context);
  }
}
