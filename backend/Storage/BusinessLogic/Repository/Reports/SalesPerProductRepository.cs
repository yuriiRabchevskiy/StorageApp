using BusinessLogic.Models.Api;
using DataAccess;
using DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using BusinessLogic.Helpers;

namespace BusinessLogic.Repository.Reports
{
  public interface ISalesPerProductRepository
  {
    Task<IEnumerable<ApiSale>> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till);
  }

  public class SalesPerProductRepository : ISalesPerProductRepository
  {

    private IServiceProvider _di;

    public SalesPerProductRepository(IServiceProvider serviceProvider)
    {
      _di = serviceProvider;
    }

    public async Task<IEnumerable<ApiSale>> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till)
    {
      List<ProductAction> soldProducts;
      Dictionary<int, Product> products;
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        soldProducts = await context.ProductsTrqansactions
          .Where(it => isAdmin || it.UserId == userId)
          .Where(it => it.Operation == OperationDescription.Sold)
          .Where(it => from <= it.Date && it.Date <= till)
          .ToListAsync().ConfigureAwait(false);
      }

      using (var context = _di.GetService<ApplicationDbContext>())
      {
        products = await context.Products.ToDictionaryAsync(it => it.Id, it => it).ConfigureAwait(false);
      }

      var result = soldProducts.GroupBy(it => it.ProductId).Select(it =>
      {
        return new ApiSale
        {
          Category = products[it.Key].BuildFullName(),
          Sales = -it.Sum(trn => trn.Price * trn.Quantity),
          BuyPrice = -it.Sum(trn => trn.BuyPrice * trn.Quantity),
          Quantity = -it.Sum(trn => trn.Quantity)
        };
      }).OrderByDescending(it => it.Quantity);
      return result;
    }
  }
}
