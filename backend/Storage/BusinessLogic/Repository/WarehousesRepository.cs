using AutoMapper;
using BusinessLogic.Models.Api;
using DataAccess;
using DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogic.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BusinessLogic.Repository
{
  public interface IWarehouseRepository
  {
    List<ApiWarehouse> Get();
    int Add(ApiWarehouse warehouse);
    void Update(ApiWarehouse warehouse);
    void Delete(int id);
    void TransferProduct(string userId, int prouductId, ApiProdTransfer info);
    void RemoveProduct(string userId, int productId, ApiProdAction info);
    void AddProduct(string userId, int productId, ApiProdAction info);
    void SellOrder(string userId, ApiSellOrder info);
    Task<bool> CancelOrderAsync(string userId, int id, string reason);
  }

  public class WarehousesRepository : IWarehouseRepository
  {

    private IServiceProvider _di;
    private ClientTimeZone ClientTyme { get; set; }

    public WarehousesRepository(IServiceProvider serviceProvider, IConfiguration configuration)
    {
      _di = serviceProvider;      
      ClientTyme = new ClientTimeZone(configuration["ShiftTimeZone"]);
    }

    public List<ApiWarehouse> Get()
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        return context.Warehouses.Where(it => it.IsActive).Select(Mapper.Map<ApiWarehouse>).ToList();
      }
    }

    public int Add(ApiWarehouse api)
    {
      var it = Mapper.Map<Warehouse>(api);
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        it.IsActive = true;
        context.Warehouses.Add(it);
        context.SaveChanges();
      }
      return it.Id;
    }

    public void Update(ApiWarehouse it)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var real = context.Warehouses.Find(it.Id);
        if (real != null)
        {
          real.Address = it.Address;
          real.Description = it.Description;
          real.Name = real.Name;
        }
        context.SaveChanges();
      }
    }

    public void Delete(int id)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var product = context.Warehouses.Find(id);
        if (product == null) return;
        product.IsActive = false;
        context.SaveChanges();
      }
    }

    public void TransferProduct(string userId, int productId, ApiProdTransfer info)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var from = getStockAndVerify(productId, info, context);

        using (var transaction = context.Database.BeginTransaction())
        {
          try
          {
            var to = context.WarehouseProducts.FirstOrDefault(it => it.ProductId == productId && it.WarehouseId == info.ToId);
            if (to == null)
            {
              to = new WarehouseProducts() { ProductId = productId, WarehouseId = info.ToId, Quantity = 0 };
              context.WarehouseProducts.Add(to);
            }

            to.Quantity += info.Quantity;
            context.SaveChanges();

            var date = ClientTyme.Now;
            context.ProductsTrqansactions.Add(new ProductAction
            {
              ProductId = productId,
              Quantity = -info.Quantity,
              WerehouseId = info.FromId,
              UserId = userId,
              Date = date,
              Description = $"Transfering item from warehouse {info.FromId} to warehouse {info.ToId} (Decrease)",
              Operation = OperationDescription.TransferRemove,
              Price = 0,
            });
            context.SaveChanges();

            context.ProductsTrqansactions.Add(new ProductAction()
            {
              ProductId = productId,
              Quantity = info.Quantity,
              WerehouseId = info.ToId,
              UserId = userId,
              Date = date,
              Description = $"Transfering item from warehouse {info.FromId} to warehouse {info.ToId} (Increase)",
              Operation = OperationDescription.TransferAdd,
              Price = 0,
            });
            context.SaveChanges();

            // Commit transaction if all commands succeed, transaction will auto-rollback
            // when disposed if either commands fails
            transaction.Commit();
          }
          catch (Exception ex)
          {
            // TODO: Handle failure
            throw ex;
          }
        }
      }
    }

    public void SellOrder(string userId, ApiSellOrder info)
    {
      var oi = info;
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        using (var transaction = context.Database.BeginTransaction())
        {
          var date = ClientTyme.Now;
          var order = Mapper.Map<Order>(oi);
          order.OpenDate = date;
          order.Status = OrderStatus.Open;
          order.ResponsibleUserId = userId;
          order.Transactions = new List<ProductAction>();


          foreach (var productOrder in info.ProductOrders)
          {
            var from = getStockAndVerify(productOrder.IdProduct, productOrder, context);
            var prodOrder = new ProductAction
            {
              Date = date,
              ProductId = productOrder.IdProduct,
              Quantity = -productOrder.Quantity,
              WerehouseId = productOrder.FromId,
              Description = productOrder.Description,
              Price = productOrder.Price,
              UserId = userId,
              Operation = OperationDescription.Sold,

            };
            order.Transactions.Add(prodOrder);
          }

          context.Orders.Add(order);
          context.SaveChanges();

          transaction.Commit();
        }
      }
    }

    public async Task<bool> CancelOrderAsync(string userId, int id, string reason)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        using (var transaction = context.Database.BeginTransaction())
        {
          var order = await context.Orders.Include(it => it.Transactions)
            .FirstOrDefaultAsync(it => it.Id == id).ConfigureAwait(false);

          if (order.Status == OrderStatus.Canceled) throw new ArgumentException("Current order is already canceled");

          var warehouses = context.WarehouseProducts.Include(it => it.Product);

          if (order != null)
          {
            order.Status = OrderStatus.Canceled;
            order.CloseDate = DateTime.Now;
            order.CanceledByUserId = userId;
            order.CancelReason = reason;
          }

          var revertActions = new List<ProductAction>();

          var date = ClientTyme.Now;
          foreach (var action in order.Transactions)
          {
            var from = warehouses.FirstOrDefault(it => it.ProductId == action.ProductId && it.WarehouseId == action.WerehouseId);
            from.Quantity += action.Quantity * -1; // quantity is negative in sale action

            var restoreAction = new ProductAction
            {
              Date = date,
              ProductId = action.ProductId,
              Quantity = -action.Quantity, // quantity is negative in sale action
              WerehouseId = action.WerehouseId,
              Description = $"Restored from order {id}",
              Price = action.Price,
              BuyPrice = from.Product.RecommendedBuyPrice,
              UserId = userId,
              Operation = OperationDescription.TransferAdd,
            };
            revertActions.Add(restoreAction);
          }

          order.Transactions.AddRange(revertActions);

          context.SaveChanges();
          transaction.Commit();
        }


      }

      return true;
    }

    public void RemoveProduct(string userId, int productId, ApiProdAction info)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var from = getStockAndVerify(productId, info, context);

        using (var transaction = context.Database.BeginTransaction())
        {
          try
          {

            var date = ClientTyme.Now;
            var action = new ProductAction()
            {
              ProductId = productId,
              Quantity = -info.Quantity,
              WerehouseId = info.FromId,
              Description = info.Description,
              UserId = userId,
              Date = date,
              Operation = OperationDescription.Delete
            };
            context.ProductsTrqansactions.Add(action);
            context.SaveChanges();

            // Commit transaction if all commands succeed,
            // transaction will auto-rollback when disposed if either commands fails
            transaction.Commit();
          }
          catch (Exception ex)
          {
            Console.WriteLine(ex.ToString());
            // TODO: Handle failure
            throw;
          }
        }
      }
    }

    public void AddProduct(string userId, int productId, ApiProdAction info)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var from = context.WarehouseProducts.FirstOrDefault(it => it.ProductId == productId && it.WarehouseId == info.FromId);
        if (from == null)
        {
          from = new WarehouseProducts() { ProductId = productId, WarehouseId = info.FromId, Quantity = 0 };
          context.WarehouseProducts.Add(from);
        }
        from.Quantity += info.Quantity;

        using (var transaction = context.Database.BeginTransaction())
        {
          try
          {
            context.SaveChanges();

            var date = ClientTyme.Now;
            context.ProductsTrqansactions.Add(new ProductAction()
            {
              ProductId = productId,
              Quantity = info.Quantity,
              WerehouseId = info.FromId,
              UserId = userId,
              Date = date,
              Description = $"Items added by user",
              Operation = OperationDescription.StockRenew,
              Price = 0,
            });
            context.SaveChanges();

            // Commit transaction if all commands succeed, transaction will auto-rollback
            // when disposed if either commands fails
            transaction.Commit();
          }
          catch (Exception ex)
          {
            // TODO: Handle failure
            throw ex;
          }
        }
      }
    }

    private static WarehouseProducts getStockAndVerify(int productId, ApiProdAction info, ApplicationDbContext context)
    {
      var from = context.WarehouseProducts.Include(it => it.Product).FirstOrDefault(it => it.ProductId == productId && it.WarehouseId == info.FromId);
      if (from == null) throw new ArgumentException($"No product with ID {productId} found on requested warehouse");
      if (from.Quantity < info.Quantity) throw new ArgumentException($"There is no enough items to trasfer in stock (ProductID: {from.Product.ProductType } - {from.Product.Model})");
      from.Quantity -= info.Quantity;
      return from;
    }

  }
}