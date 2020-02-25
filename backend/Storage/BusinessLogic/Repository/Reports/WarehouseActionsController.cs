using DataAccess;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using BusinessLogic.Models.Api.Reports;
using BusinessLogic.Helpers;

namespace BusinessLogic.Repository.Reports
{
  public interface IWarehouseActionsRepository
  {
    Task<IEnumerable<ApiWarehouseAction>> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till);
  }

  public class WarehouseActionsRepository : IWarehouseActionsRepository
  {

    private IServiceProvider _di;
    private readonly IMapper _mapper;

    public WarehouseActionsRepository(IServiceProvider serviceProvider, IMapper mapper)
    {
      _di = serviceProvider;
      _mapper = mapper;
    }

    public async Task<IEnumerable<ApiWarehouseAction>> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var dbdata = await context.ProductsTrqansactions
          .Where(it => it.Operation != DataAccess.Models.OperationDescription.Sold)
          .Where(it => from <= it.Date && it.Date <= till)
          .Include(act => act.Warehouse)
          .Include(act => act.User)
          .Include(act => act.Product).OrderByDescending(it => it.Date).ToListAsync().ConfigureAwait(false);

        var result = dbdata.Select(it =>
        {
          var api = _mapper.Map<ApiWarehouseAction>(it);
          api.Operation = it.GetOperationString();
          api.Warehouse = it.Warehouse.Name;
          api.User = it.User.BuildFullName();
          api.ProductString = it.Product.BuildFullName();
          return api;
        });

        return result;
      }
    }
  }
}
