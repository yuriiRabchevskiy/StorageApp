using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DataAccess.Models;
using BusinessLogic.Models.Api;
using AutoMapper;
using BusinessLogic.Helpers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DataAccess.Repository
{
  public interface IOrdersRepository
  {
    Task<List<ApiOrder>> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till);
    Task<List<ApiOrder>> GetCanceledOrdersAsync(string userId, bool isAdmin, DateTime from, DateTime till);
    void Update(ApiOrder product);
  }

  public class OrdersRepository : IOrdersRepository
  {

    private IServiceProvider _di;
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
        var data = await context.Orders
          .Where(it => isAdmin || it.ResponsibleUserId == userId)
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

    public void Update(ApiOrder it)
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
          if (it.Status == OrderStatus.Canceled && order.CanceledDate == null) order.CanceledDate = ClientTime.Now;
        }
        context.SaveChanges();
      }
    }
  }
}
