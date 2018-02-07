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
    List<ApiOrder> Get(string userId, bool isAdmin);
    void Update(ApiOrder product);
  }

  public class OrdersRepository : IOrdersRepository
  {

    private IServiceProvider _di;
    private ClientTimeZone ClientTyme { get; set; }

    public OrdersRepository(IServiceProvider serviceProvider, IConfiguration configuration)
    {
      _di = serviceProvider;
      ClientTyme = new ClientTimeZone(configuration["ShiftTimeZone"]);
    }

    public List<ApiOrder> Get(string userId, bool isAdmin)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        return context.Orders.Where(it => it.Status != OrderStatus.Canceled && (isAdmin || it.ResponsibleUserId == userId)).Include(ord => ord.ResponsibleUser)
          .Include(ord => ord.Transactions).ThenInclude(y => y.Product).ToList().Select(ord =>
        {
          var api = Mapper.Map<ApiOrder>(ord);
          var prefix = string.IsNullOrEmpty(ord.ResponsibleUser.Surname) ? "" : ord.ResponsibleUser.Surname + " ";
          api.Seller = prefix + ord.ResponsibleUser.Name;
          api.TotalPrice = ord.Transactions.Sum(trn => -trn.Price * trn.Quantity);
          api.Products = ord.Transactions.Select(it => new ApiProdOrder
          {
            Price = it.Price,
            Quantity = -it.Quantity,
            BuyPrice = it.BuyPrice,
            Product = Mapper.Map<ApiProduct>(it.Product),
            TotalPrice = -it.Price * it.Quantity
          });
          return api;
        }).ToList();
      }
    }

    public void Update(ApiOrder it)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var order = context.Orders.Find(it.Id);

        if (order != null)
        {
          if (order.Status == OrderStatus.Canceled) throw new ArgumentException("Current order is already canceled");
          order.ClientName = it.ClientName;
          order.ClientAddress = it.ClientAddress;
          order.ClientPhone = it.ClientPhone;
          order.OrderNumber = it.OrderNumber;
          order.Other = it.Other;
          order.Status = it.Status ?? OrderStatus.Open;
          order.Payment = it.Payment;
          if (it.Status == OrderStatus.Closed && order.CloseDate == null) order.CloseDate = DateTime.Now;
        }
        context.SaveChanges();
      }
    }
  }
}
