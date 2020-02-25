using BusinessLogic.Models.Api;
using DataAccess;
using DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using BusinessLogic.Helpers;

namespace BusinessLogic.Repository.Reports
{
  public interface ISalesPerUserRepository
  {
    Task<IEnumerable<ApiSalePerUser>> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till);
  }

  public class SalesPerUserRepository : ISalesPerUserRepository
  {

    private IServiceProvider _di;
    private readonly IMapper _mapper;

    public SalesPerUserRepository(IServiceProvider serviceProvider, IMapper mapper)
    {
      _di = serviceProvider;
      _mapper = mapper;
    }

    public async Task<IEnumerable<ApiSalePerUser>> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till)
    {
      List<ApiOrder> orders;
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var data = await context.Orders
          .Where(it => isAdmin || it.ResponsibleUserId == userId)
          .Where(it => it.Status == OrderStatus.Closed)
          .Where(it => from <= it.OpenDate && it.OpenDate <= till)
          .Include(ord => ord.ResponsibleUser)
          .Include(ord => ord.Transactions).ThenInclude(y => y.Product).ToListAsync().ConfigureAwait(false);
        orders = data.ToApi(_mapper);
      }

      var result = orders.GroupBy(it => it.Seller).Select(it =>
      {
        return new ApiSalePerUser
        {
          Category = it.Key,
          OrdersCount = it.Count(),
          Sales = it.Sum(trn => trn.TotalPrice),
          BuyPrice = it.Sum(trn => trn.TotalBuyPrice),
          Quantity = it.Sum(trn => trn.Products.Sum(prod => prod.Quantity))
        };
      });
      return result;
    }
  }
}
