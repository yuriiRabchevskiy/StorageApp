using System;
using System.Collections.Generic;
using System.Linq;
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

    public Task ProductsCountChangedAsync(IEnumerable<ApiProdCountChange> changes, int revision)
    {
      return _context.Clients.All.SendAsync("productsCountChanged", new ApiProdCountChanges { Changes = changes, StateRevision = revision });
    }

    public Task OrderChangedAsync(IEnumerable<ApiOrderDetailsChange> changes, int revision)
    {
      var changesL = changes.ToList();
      foreach (var change in changesL.Where(it => it.Order.Products != null))
      {
        change.Order.Products = null; // we do not want to sent products
      }

      return _context.Clients.All.SendAsync("orderChanged", new ApiOrderDetailsChanges
      {
        Changes = changesL,
        StateRevision = revision
      });
    }
  }

}
