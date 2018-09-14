using BusinessLogic.Models.Api;
using DataAccess;
using DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using BusinessLogic.Helpers;
using System.Text;
using System.Globalization;

namespace BusinessLogic.Repository.Reports
{
  public interface IOpenOrdersRepository
  {
    Task<string> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till);
    Task<string> GetLightweightAsync(string userId, bool isAdmin, DateTime from, DateTime till);
  }

  public class OpenOrdersRepository : IOpenOrdersRepository
  {

    private static CultureInfo ukUA = CultureInfo.GetCultureInfo("uk-UA");
    private static string DateFormat = "dd.MM.yyyy HH:mm";
    private IServiceProvider _di;

    public OpenOrdersRepository(IServiceProvider serviceProvider)
    {
      _di = serviceProvider;
    }

    public async Task<string> GetAsync(string userId, bool isAdmin, DateTime from, DateTime till)
    {
      List<Order> orders;
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        orders = await context.Orders
        .Where(it => isAdmin || it.ResponsibleUserId == userId)
        .Where(it => it.Status == OrderStatus.Open)
        .Where(it => from <= it.OpenDate && it.OpenDate <= till)
        .Include(ord => ord.ResponsibleUser)
        .Include(ord => ord.Transactions).ThenInclude(y => y.Product).OrderBy(it => it.OpenDate).ToListAsync().ConfigureAwait(false);
      }

      var sb = new StringBuilder();
      sb.AppendLine(DateTime.Now.ToString(DateFormat, ukUA));
      sb.AppendLine("<hr/>");
      sb.AppendLine("");
      foreach (var order in orders)
      {
        sb.AppendLine($"<b>{order.OpenDate.ToString(DateFormat, ukUA)}</b>");
        sb.AppendLine($"Замовлення <b>{order.Id} - {order.ClientName}</b>");
        sb.AppendLine($"Накладна: <b>{order.OrderNumber}</b>");
        sb.AppendLine($"Товари:");
        foreach (var product in order.Transactions)
        {
          sb.AppendLine($"    <b> {-product.Quantity}x</b>    {product.Product.BuildFullName()}");
        }
        sb.AppendLine("<hr/>");
        sb.AppendLine("");
        sb.AppendLine("");
      }
      sb.AppendLine("Кінець звіту.");
      sb.AppendLine("<hr/>");
      return sb.ToString();
    }

    public async Task<string> GetLightweightAsync(string userId, bool isAdmin, DateTime from, DateTime till)
    {
      List<Order> orders;
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        orders = await context.Orders
        .Where(it => isAdmin || it.ResponsibleUserId == userId)
        .Where(it => it.Status == OrderStatus.Open)
        .Where(it => from <= it.OpenDate && it.OpenDate <= till)
        .Include(ord => ord.ResponsibleUser)
        .Include(ord => ord.Transactions).ThenInclude(y => y.Product).OrderBy(it => it.OpenDate).ToListAsync().ConfigureAwait(false);
      }

      var sb = new StringBuilder();
      sb.AppendLine(DateTime.Now.ToString(DateFormat, ukUA));
      sb.Append("<hr/>");
      foreach (var order in orders)
      {
        sb.Append($"<div class=\"order\">");
        sb.AppendLine($"<b>{order.OpenDate.ToString(DateFormat, ukUA)}</b>");
        sb.AppendLine($"Замовлення <b>{order.Id} - {order.ClientName}</b>");
        sb.Append($"Накладна: <b>{order.OrderNumber}</b>");
        sb.AppendLine($"</div>");
      }
      sb.AppendLine("Кінець звіту.");
      sb.AppendLine("<hr/>");
      return sb.ToString();
    }
  }
}
