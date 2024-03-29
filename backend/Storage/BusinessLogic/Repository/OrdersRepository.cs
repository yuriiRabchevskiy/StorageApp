using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DataAccess.Models;
using BusinessLogic.Models.Api;
using BusinessLogic.Abstractions;
using BusinessLogic.Helpers;
using BusinessLogic.Models.Api.State;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace DataAccess.Repository
{
  public interface IOrdersRepository
  {
    Task<ApiOrder> GetAsync(int orderId);
    Task<(List<ApiOrder>, int)> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till);
    Task<List<ApiOrder>> GetArchiveAsync(string userId, bool isAdmin, DateTime from, DateTime till);
    Task<List<ApiOrder>> GetCanceledOrdersAsync(string userId, bool isAdmin, DateTime from, DateTime till);

    Task<IReadOnlyCollection<ApiOrderAction>> GetOrderHistoryAsync(string userId, bool isAdmin, int orderId);
    Task UpdateAsync(string userId, bool isAdmin, ApiOrder product);
    Task MoveOrderToAsync(string userId, ApiOrderMoveCommand command);
  }
  public class OrdersRepository : IOrdersRepository
  {
    private readonly IServiceProvider _di;
    private readonly IMapper _mapper;
    private readonly IStateService _state;
    IStateInformer Informer => _di.GetService<IStateInformer>();

    public OrdersRepository(IServiceProvider serviceProvider, IMapper mapper)
    {
      _di = serviceProvider;
      _mapper = mapper;
      _state = serviceProvider.GetRequiredService<IStateService>();
    }

    public async Task<(List<ApiOrder>, int)> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till)
    {
      await using var context = _di.GetRequiredService<ApplicationDbContext>();
      // Where(it => isAdmin || it.ResponsibleUserId == userId)
      var query = context.Orders
        .Where(it => it.Status != OrderStatus.Canceled) // we skip all canceled
                                                        // and all in progress except those that were already delivered within range
        .Where(it => it.Status != OrderStatus.Delivered || (it.OpenDate >= @from && it.OpenDate <= till))
        .Include(ord => ord.ResponsibleUser)
        .Include(ord => ord.Transactions)
        .ThenInclude(y => y.Product).AsNoTracking();
      var data = await query.AsNoTracking().ToListAsync().ConfigureAwait(false);
      var state = await context.AppState.FirstAsync();
      return (data.ToApi(_mapper), state.OrdersRevision);
    }

    public async Task<ApiOrder> GetAsync(int orderId)
    {
      await using var context = _di.GetRequiredService<ApplicationDbContext>();
      var query = context.Orders.Where(it => it.Id == orderId);
      var data = await query.AsNoTracking().ToListAsync().ConfigureAwait(false);
      return data.ToApi(_mapper).FirstOrDefault();
    }

    public async Task<List<ApiOrder>> GetArchiveAsync(string userId, bool isAdmin, DateTime from, DateTime till)
    {
      await using var context = _di.GetService<ApplicationDbContext>();
      // Where(it => isAdmin || it.ResponsibleUserId == userId)f
      var query = context.Orders
        .Where(it => (it.Status == OrderStatus.Delivered) && it.OpenDate >= @from && it.OpenDate <= till)
        .Include(ord => ord.ResponsibleUser)
        .Include(ord => ord.Transactions)
        .ThenInclude(y => y.Product);
      var data = await query.AsNoTracking().ToListAsync().ConfigureAwait(false);
      return data.ToApi(_mapper);
    }

    public async Task<IReadOnlyCollection<ApiOrderAction>> GetOrderHistoryAsync(string userId, bool isAdmin, int orderId)
    {
      await using var context = _di.GetService<ApplicationDbContext>();
      // Where(it => isAdmin || it.ResponsibleUserId == userId)

      var query = context.OrderAction.AsNoTracking().Include(it => it.User).Where(it => it.OrderId == orderId);

      var data = await query.ToListAsync().ConfigureAwait(false);
      return data.Select(it =>
      {
        var mapped = _mapper.Map<ApiOrderAction>(it);
        mapped.User = it.User.Name;
        return mapped;
      }).ToList();
    }



    public async Task<List<ApiOrder>> GetCanceledOrdersAsync(string userId, bool isAdmin, DateTime from, DateTime till)
    {
      await using var context = _di.GetService<ApplicationDbContext>();
      var data = await context.Orders
        .Where(it => isAdmin || it.ResponsibleUserId == userId)
        .Where(it => it.Status == OrderStatus.Canceled && it.CloseDate >= @from && it.CloseDate <= till)
        .Include(ord => ord.ResponsibleUser)
        .Include(ord => ord.CanceledByUser)
        .Include(ord => ord.Transactions).ThenInclude(y => y.Product).ToListAsync().ConfigureAwait(false);
      data.ForEach(it => it.Transactions = it.Transactions.Where(tr => tr.Quantity < 0).ToList());
      return data.ToApi(_mapper);
    }

    public async Task UpdateAsync(string userId, bool isAdmin, ApiOrder it)
    {
      await using var context = _di.GetRequiredService<ApplicationDbContext>();
      var order = await context.Orders.FindAsync(it.Id);

      if (order == null) return;

      if (order.Status == OrderStatus.Canceled) throw new ArgumentException("Замовлення скасоване і не може редагуватися");
      if (!isAdmin && order.ResponsibleUserId != userId) throw new ArgumentException("Замовлення створене іншим користувачем і не може редагуватися");
      order.ClientName = it.ClientName;
      order.ClientAddress = it.ClientAddress;
      order.ClientPhone = it.ClientPhone;
      order.TrackingNumber = it.OrderNumber;
      order.Other = it.Other;
      order.Status = it.Status ?? OrderStatus.Open;
      order.Delivery = it.Delivery;
      order.Payment = it.Payment;
      if (it.Status == OrderStatus.Delivered && order.CloseDate == null) order.CloseDate = DateTime.UtcNow;
      if (it.Status == OrderStatus.Canceled && order.CanceledDate == null)
      {
        order.CanceledDate = DateTime.UtcNow;
        order.CanceledByUserId = userId;
      }

      var note = order.ResponsibleUserId != userId ? "Відредаговано іншим продавцем" : null;
      var operation = OrderOperation.Created;
      if (order.Id != 0)
      {
        switch (order.Status)
        {
          case OrderStatus.Canceled: operation = OrderOperation.Canceled; break;
          case OrderStatus.Delivered: operation = OrderOperation.Closed; break;
          default: operation = OrderOperation.Updated; break;
        }
      }

      order.OrderEditions = new List<OrderAction>(new[] {
            new OrderAction {
              Date = DateTime.UtcNow,
              OrderId = order.Id,
              UserId = userId,
              Note = note,
              Operation = operation,
              OrderJson = JsonConvert.SerializeObject(it)}
            });

      it.Products = null; // we do not want to sent this back to the client.

      var revision = await _state.UpdateOrdersStateCounterAsync(context);
      await context.SaveChangesAsync().ConfigureAwait(false);

      await Informer.OrderChangedAsync(new[] {new ApiOrderDetailsChange
      {
        OrderId = order.Id,
        Order = it,
        ChangeTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
      } }, revision).ConfigureAwait(false);
    }

    public async Task MoveOrderToAsync(string userId, ApiOrderMoveCommand command)
    {
      await using var context = _di.GetRequiredService<ApplicationDbContext>();
      var orders = await context.Orders.Where(it => command.Ids.Contains(it.Id)).ToListAsync();

      var canceledOrders = orders.FirstOrDefault(order => order.Status == OrderStatus.Canceled);
      if (canceledOrders != null) throw new ArgumentException($"Замовлення {canceledOrders.Id} скасоване і не може редагуватися");

      var operation = command.OrderStatus == OrderStatus.Delivered ? OrderOperation.Closed : OrderOperation.Moved;

      foreach (var order in orders)
      {
        order.Status = command.OrderStatus;

        if (command.OrderStatus == OrderStatus.Delivered && order.CloseDate == null)
        {
          order.CloseDate = DateTime.UtcNow;
        }
        context.OrderAction.Add(new OrderAction
        {
          Date = DateTime.UtcNow,
          OrderId = order.Id,
          UserId = userId,
          Note = $"Статус замовлення змінено на {command.OrderStatus}",
          Operation = operation,
          OrderJson = JsonConvert.SerializeObject(command)
        });
      }

      var revision = await _state.UpdateOrdersStateCounterAsync(context);
      await context.SaveChangesAsync().ConfigureAwait(false);

      foreach (var order in orders)
      {
        var apiOrder = _mapper.Map<ApiOrder>(order);
        await Informer.OrderChangedAsync(new[] {new ApiOrderDetailsChange
          {
            OrderId = order.Id,
            Order = apiOrder,
            ChangeTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
          } }, revision).ConfigureAwait(false);
      }
    }
  }
}
