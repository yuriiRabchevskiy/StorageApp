using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessLogic.Abstractions;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
  public class StateService : IStateService
  {
    public async Task<int> UpdateProductsStateCounterAsync(ApplicationDbContext context)
    {
      var current = await context.AppState.FirstAsync(); // there always has to be a state
      current.ProductsRevision += 1;
      return current.ProductsRevision;
    }

    public async Task<int> UpdateOrdersStateCounterAsync(ApplicationDbContext context)
    {
      var current = await context.AppState.FirstAsync(); // there always has to be a state
      current.OrdersRevision += 1;
      return current.OrdersRevision;

    }
  }
}
