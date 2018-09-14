using BusinessLogic.Models.Api;
using DataAccess;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using DataAccess.Models;
using BusinessLogic.Helpers;

namespace BusinessLogic.Repository.Reports
{
  public interface IOrdersOverviewRepository
  {
    Task<IEnumerable<ApiOrdersOverview>> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till);
  }

  public class OrdersOverviewRepository : IOrdersOverviewRepository
  {
    private IServiceProvider _di;

    public OrdersOverviewRepository(IServiceProvider serviceProvider)
    {
      _di = serviceProvider;
    }

    public async Task<IEnumerable<ApiOrdersOverview>> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till)
    {

      List<ApiOrder> orders;
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var data = await context.Orders
        .Where(it => isAdmin || it.ResponsibleUserId == userId)
        .Where(it => from <= it.OpenDate && it.OpenDate <= till)
        .Include(ord => ord.ResponsibleUser)
        .Include(ord => ord.Transactions).ThenInclude(y => y.Product).ToListAsync().ConfigureAwait(false);

        orders = data.ToApi();

      }

      var res = orders.GroupBy(it => it.Seller).Select(it =>
      {
        var canceled = it.Where(order => order.Status == OrderStatus.Canceled).ToList();
        var closed = it.Where(order => order.Status == OrderStatus.Closed).ToList();
        var open = it.Where(order => order.Status == OrderStatus.Open || order.Status == OrderStatus.Processing).ToList();

        return new ApiOrdersOverview
        {
          Category = it.Key,
          OrdersCount = it.Count(),
          Sales = it.Sum(trn => trn.TotalPrice),
          CanceledCount = canceled.Count,
          CanceledPrice = canceled.Sum(trn => trn.TotalPrice),
          OpenCount = open.Count,
          OpenPrice = open.Sum(trn => trn.TotalPrice),
          ClosedCount = closed.Count,
          ClosedPrice = closed.Sum(trn => trn.TotalPrice),
          BuyPrice = it.Sum(trn => trn.TotalBuyPrice),
          Quantity = it.Sum(trn => trn.Products.Sum(prod => prod.Quantity))
        };
      });
      return res;
    }
  }
}
