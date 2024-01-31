using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using BusinessLogic.Helpers;
using BusinessLogic.Models.Api.Client;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BusinessLogic.Repository
{
  public interface IClientOrdersRepository
  {
    Task<List<ApiClientOrder>> GetAsync(string userId, int take = 20);
  }
  public class ClientOrdersRepository : IClientOrdersRepository
  {
    private readonly IServiceProvider _di;
    private readonly IMapper _mapper;

    public ClientOrdersRepository(IServiceProvider serviceProvider, IMapper mapper)
    {
      _di = serviceProvider;
      _mapper = mapper;
    }

    public async Task<List<ApiClientOrder>> GetAsync(string userId, int take = 20)
    {
      await using var context = _di.GetRequiredService<ApplicationDbContext>();

      // get top X orders created by specific client 
      var query = context.Orders
        .Where(it => it.ResponsibleUserId == userId)
        .Include(ord => ord.ResponsibleUser)
        .Include(ord => ord.Transactions).ThenInclude(y => y.Product)
        .OrderByDescending(it => it.OpenDate)
        .Take(take)
        .AsNoTracking();
      var data = await query.AsNoTracking().ToListAsync();
      return data.ToApiClientOrder(_mapper);
    }

  }
}
