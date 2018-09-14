using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Storage.Code.Hubs
{
  public class TrackerHub : Hub
  {
    public Task Send(string message)
    {
      return Clients.All.SendAsync("Send", message);
    }
  }
}
