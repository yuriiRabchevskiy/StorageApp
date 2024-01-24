using BusinessLogic.Models.Api;
using DataAccess;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
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
    private readonly IServiceProvider _di;
    private readonly IMapper _mapper;

    public OrdersOverviewRepository(IServiceProvider serviceProvider, IMapper mapper)
    {
      _di = serviceProvider;
      _mapper = mapper;
    }

    public async Task<IEnumerable<ApiOrdersOverview>> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till)
    {

      List<ApiOrder> orders;
      await using (var context = _di.GetRequiredService<ApplicationDbContext>())
      {
        var data = await context.Orders
        .Where(it => isAdmin || it.ResponsibleUserId == userId)
        .Where(it => from <= it.OpenDate && it.OpenDate <= till)
        .Include(ord => ord.ResponsibleUser)
        .Include(ord => ord.Transactions).ThenInclude(y => y.Product)
        .AsNoTracking().ToListAsync().ConfigureAwait(false);

        orders = data.ToApi(_mapper);

      }

      var res = orders.GroupBy(it => it.Seller).Select(it =>
      {
        var canceled = it.Where(order => order.Status == OrderStatus.Canceled).ToList();
        var closed = it.Where(order => order.Status == OrderStatus.Delivered).ToList();
        var open = it.Where(order => order.Status != OrderStatus.Canceled && order.Status != OrderStatus.Delivered).ToList();

        return new ApiOrdersOverview
        {
          Category = it.Key,
          OrdersCount = it.Count(),
          Sales = it.Sum(trn => trn.TotalPrice),
          CanceledCount = canceled.Count,
          CanceledPrice = canceled.Sum(trn => trn.TotalPrice),
          OpenCount = open.Count,
          OpenPrice = open.Sum(trn => trn.TotalPrice),
          OpenDiscount = open.Sum(trn => trn.TotalDiscount),
          ClosedCount = closed.Count,
          ClosedPrice = closed.Sum(trn => trn.TotalPrice),
          CloseDiscount = closed.Sum(trn => trn.TotalDiscount),
          BuyPrice = it.Sum(trn => trn.TotalBuyPrice),
          Quantity = it.Sum(trn => trn.Products.Sum(prod => prod.Quantity))
        };
      });
      return res;
    }
  }
}
