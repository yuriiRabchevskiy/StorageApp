using System;
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

    public Task ProductsCountChangedAsync(ApiProdCountChanges changes)
    {
      var connectionId = Context?.ConnectionId;
      return _context.Clients.AllExcept(connectionId).SendAsync("productsCountChanged", changes);
    }
  }

}
