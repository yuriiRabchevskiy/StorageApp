using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessLogic.Abstractions;
using BusinessLogic.Models.Api.State;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Storage.Code.Hubs
{
  [Authorize(AuthenticationSchemes = "Bearer")]
  public class TrackerHub : Hub<IStateInformer>, IStateInformer
  {
    private readonly IHubContext<TrackerHub> _context;

    public TrackerHub(IHubContext<TrackerHub> context)
    {
      _context = context;
    }

    public Task ProductsCountChangedAsync(IEnumerable<ApiProdCountChange> changes)
    {
      return _context.Clients.All.SendAsync("productsCountChanged", new ApiProdCountChanges { Changes = changes });
    }

    public Task OrderChangedAsync(IEnumerable<ApiOrderDetailsChange> changes)
    {
      return _context.Clients.All.SendAsync("orderChanged", new ApiOrderDetailsChanges { Changes = changes });
    }
  }

}
