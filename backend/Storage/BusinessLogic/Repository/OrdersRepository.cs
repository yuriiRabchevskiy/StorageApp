using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DataAccess.Models;
using BusinessLogic.Models.Api;
using AutoMapper;
using BusinessLogic.Abstractions;
using BusinessLogic.Helpers;
using BusinessLogic.Models.Api.State;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DataAccess.Repository
{
  public interface IOrdersRepository
  {
    Task<List<ApiOrder>> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till);
    Task<List<ApiOrder>> GetCanceledOrdersAsync(string userId, bool isAdmin, DateTime from, DateTime till);
    Task UpdateAsync(string userId, bool isAdmin, ApiOrder product);
  }

  public class OrdersRepository : IOrdersRepository
  {

    private readonly IServiceProvider _di;
    IStateInformer Informer => _di.GetService<IStateInformer>();
    private ClientTimeZone ClientTime { get; set; }

    public OrdersRepository(IServiceProvider serviceProvider, IConfiguration configuration)
    {
      _di = serviceProvider;
      ClientTime = new ClientTimeZone(configuration["ShiftTimeZone"]);
    }

    public async Task<List<ApiOrder>> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        // Where(it => isAdmin || it.ResponsibleUserId == userId)
        var data = await context.Orders
          .Where(it => it.Status != OrderStatus.Canceled)
          .Include(ord => ord.ResponsibleUser)
          .Include(ord => ord.Transactions).ThenInclude(y => y.Product).ToListAsync().ConfigureAwait(false);
        return data.ToApi();
      }
    }

    public async Task<List<ApiOrder>> GetCanceledOrdersAsync(string userId, bool isAdmin, DateTime from, DateTime till)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var data = await context.Orders
          .Where(it => isAdmin || it.ResponsibleUserId == userId)
          .Where(it => it.Status == OrderStatus.Canceled && it.CloseDate >= from && it.CloseDate <= till)
          .Include(ord => ord.ResponsibleUser)
          .Include(ord => ord.CanceledByUser)
          .Include(ord => ord.Transactions).ThenInclude(y => y.Product).ToListAsync().ConfigureAwait(false);
        data.ForEach(it => it.Transactions = it.Transactions.Where(tr => tr.Quantity < 0).ToList());
        return data.ToApi();
      }
    }

    public async Task UpdateAsync(string userId, bool isAdmin, ApiOrder it)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var order = context.Orders.Find(it.Id);

        if (order != null)
        {
          if (order.Status == OrderStatus.Canceled) throw new ArgumentException("Замовлення скасоване і не може редагуватися");
          order.ClientName = it.ClientName;
          order.ClientAddress = it.ClientAddress;
          order.ClientPhone = it.ClientPhone;
          order.OrderNumber = it.OrderNumber;
          order.Other = it.Other;
          order.Status = it.Status ?? OrderStatus.Open;
          order.Payment = it.Payment;
          if (it.Status == OrderStatus.Closed && order.CloseDate == null) order.CloseDate = ClientTime.Now;
          if (it.Status == OrderStatus.Canceled && order.CanceledDate == null)
          {
            order.CanceledDate = ClientTime.Now;
            order.CanceledByUserId = userId;
          }
          var note = order.ResponsibleUserId != userId ? "Відредаговано іншим продавцем" : null;
          order.OrderEditions = new List<OrderAction>(new[] {
            new OrderAction { Date = ClientTime.Now, OrderId = order.Id, UserId = userId, Note = note }
            });

          it.Products = null; // we do not want to sent this back to the client.
          await Informer.OrderChangedAsync(new[] {new ApiOrderDetailsChange
          {
            OrderId = order.Id,
            Order = it,
            ChangeTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
          } }).ConfigureAwait(false);
        }
        await context.SaveChangesAsync().ConfigureAwait(false);
      }
    }
  }
}
