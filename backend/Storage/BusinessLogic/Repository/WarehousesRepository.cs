using AutoMapper;
using BusinessLogic.Models.Api;
using DataAccess;
using DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BusinessLogic.Abstractions;
using BusinessLogic.Helpers;
using BusinessLogic.Models.Api.State;
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
    Task SellOrderAsync(string userId, ApiSellOrder info);
    Task<bool> CancelOrderAsync(string userId, int id, string reason);
  }

  public class WarehousesRepository : IWarehouseRepository
  {

    private readonly IServiceProvider _di;
    private ClientTimeZone ClientTime { get; set; }
    static readonly SemaphoreSlim _semaphoreSlim = new SemaphoreSlim(1, 1);

    public WarehousesRepository(IServiceProvider serviceProvider, IConfiguration configuration)
    {
      _di = serviceProvider;
      ClientTime = new ClientTimeZone(configuration["ShiftTimeZone"]);
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

            var date = ClientTime.Now;
            context.ProductsTrqansactions.Add(new ProductAction
            {
              ProductId = productId,
              Quantity = -info.Quantity,
              WarehouseId = info.FromId,
              UserId = userId,
              Date = date,
              Description = $"Переміщення товару зі складу {info.FromId} на склад {info.ToId} (Зменшення)",
              Operation = OperationDescription.TransferRemove,
              Price = 0,
            });
            context.SaveChanges();

            context.ProductsTrqansactions.Add(new ProductAction()
            {
              ProductId = productId,
              Quantity = info.Quantity,
              WarehouseId = info.ToId,
              UserId = userId,
              Date = date,
              Description = $"Переміщення товару зі складу {info.FromId} на склад {info.ToId} (Збільшення)",
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

    public async Task SellOrderAsync(string userId, ApiSellOrder info)
    {
      var oi = info;
      var changesNotes = new List<ApiProdCountChange>();
      await _semaphoreSlim.WaitAsync();
      try
      {
        using (var context = _di.GetService<ApplicationDbContext>())
        {
          using (var transaction = context.Database.BeginTransaction(IsolationLevel.ReadCommitted))
          {
            var date = ClientTime.Now;
            var order = Mapper.Map<Order>(oi);
            order.OpenDate = date;
            order.Status = OrderStatus.Open;
            order.ResponsibleUserId = userId;
            order.Transactions = new List<ProductAction>();

            foreach (var productOrder in info.ProductOrders)
            {
              var from = getStockAndVerify(productOrder.IdProduct, productOrder, context);

              var change = new ApiProdCountChange
              {
                ProductId = productOrder.IdProduct,
                WarehouseId = productOrder.FromId,
                NewCount = from.Quantity,
                OldCount = from.Quantity + productOrder.Quantity
              };
              changesNotes.Add(change);

              var prodOrder = new ProductAction
              {
                Date = date,
                ProductId = productOrder.IdProduct,
                Quantity = -productOrder.Quantity,
                WarehouseId = productOrder.FromId,
                Description = productOrder.Description,
                Price = productOrder.Price,
                BuyPrice = from.Product.RecommendedBuyPrice,
                UserId = userId,
                Operation = OperationDescription.Sold
              };
              order.Transactions.Add(prodOrder);
            }

            context.Orders.Add(order);
            await context.SaveChangesAsync();

            transaction.Commit();
          }
        }

        var informer = this._di.GetService<IStateInformer>();
        var changes = new ApiProdCountChanges { Changes = changesNotes };
        await informer.ProductsCountChangedAsync(changes).ConfigureAwait(false);
      }
      finally
      {
        _semaphoreSlim.Release();
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

          if (order.Status == OrderStatus.Canceled) throw new ArgumentException("Поточне замовлення уже скасовано");

          var warehouses = context.WarehouseProducts.Include(it => it.Product);

          if (order != null)
          {
            order.Status = OrderStatus.Canceled;
            order.CloseDate = DateTime.Now;
            order.CanceledByUserId = userId;
            order.CancelReason = reason;
          }

          var revertActions = new List<ProductAction>();

          var date = ClientTime.Now;
          foreach (var action in order.Transactions)
          {
            var from = warehouses.FirstOrDefault(it => it.ProductId == action.ProductId && it.WarehouseId == action.WarehouseId);
            from.Quantity += action.Quantity * -1; // quantity is negative in sale action

            var restoreAction = new ProductAction
            {
              Date = date,
              ProductId = action.ProductId,
              Quantity = -action.Quantity, // quantity is negative in sale action
              WarehouseId = action.WarehouseId,
              Description = $"Скасовано замовлення {id}",
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

            var date = ClientTime.Now;
            var action = new ProductAction()
            {
              ProductId = productId,
              Quantity = -info.Quantity,
              WarehouseId = info.FromId,
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

            var date = ClientTime.Now;
            context.ProductsTrqansactions.Add(new ProductAction()
            {
              ProductId = productId,
              Quantity = info.Quantity,
              WarehouseId = info.FromId,
              UserId = userId,
              Date = date,
              Description = $"Товар додано адміністратором",
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
      if (from == null) throw new ArgumentException($"Товар з ID {productId} не знайдено на складі");
      if (from.Quantity < info.Quantity) throw new ArgumentException($"Не достатньо товарів на складі для здійстення продажі (ProductID: {from.Product.ProductType } - {from.Product.Model})");
      from.Quantity -= info.Quantity;
      return from;
    }

  }
}
