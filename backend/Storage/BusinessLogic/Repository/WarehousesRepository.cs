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
using BusinessLogic.Models.Api.State;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
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
    void TransferProduct(string userId, int productId, ApiProdTransfer info);
    void RemoveProduct(string userId, int productId, ApiProdAction info);
    void AddProduct(string userId, int productId, ApiProdAction info);
    Task SellOrderAsync(string userId, ApiSellOrder info);
    Task EditSellOrderAsync(string userId, ApiEditSellOrder command);
    Task<bool> CancelOrderAsync(string userId, int id, string reason);
  }

  public class WarehousesRepository : IWarehouseRepository
  {

    private readonly IServiceProvider _di;
    private readonly IMapper _mapper;
    static readonly SemaphoreSlim _semaphoreSlim = new SemaphoreSlim(1, 1);

    IStateInformer Informer => _di.GetService<IStateInformer>();

    public WarehousesRepository(IServiceProvider serviceProvider, IConfiguration configuration, IMapper mapper)
    {
      _di = serviceProvider;
      _mapper = mapper;
    }

    #region Warehouse Management

    public List<ApiWarehouse> Get()
    {
      using var context = _di.GetRequiredService<ApplicationDbContext>();
      return context.Warehouses.Where(it => it.IsActive).ToList().Select(_mapper.Map<ApiWarehouse>).ToList();
    }

    public int Add(ApiWarehouse api)
    {
      var it = _mapper.Map<Warehouse>(api);
      using (var context = _di.GetRequiredService<ApplicationDbContext>())
      {
        it.IsActive = true;
        context.Warehouses.Add(it);
        context.SaveChanges();
      }
      return it.Id;
    }

    public void Update(ApiWarehouse it)
    {
      using var context = _di.GetRequiredService<ApplicationDbContext>();
      var real = context.Warehouses.Find(it.Id);
      if (real != null)
      {
        real.Address = it.Address;
        real.Description = it.Description;
        real.Name = real.Name;
      }
      context.SaveChanges();
    }

    public void Delete(int id)
    {
      using var context = _di.GetService<ApplicationDbContext>();
      var product = context.Warehouses.Find(id);
      if (product == null) return;
      product.IsActive = false;
      context.SaveChanges();
    }

    #endregion

    #region Product +-

    public void RemoveProduct(string userId, int productId, ApiProdAction info)
    {
      using var context = _di.GetService<ApplicationDbContext>();
      var from = getStockAndVerify(productId, info, context);

      using var transaction = context.Database.BeginTransaction();
      try
      {

        var date = DateTime.UtcNow;
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

    public void AddProduct(string userId, int productId, ApiProdAction info)
    {
      using var context = _di.GetService<ApplicationDbContext>();
      var from = context.WarehouseProducts.FirstOrDefault(it => it.ProductId == productId && it.WarehouseId == info.FromId);
      if (@from == null)
      {
        @from = new WarehouseProducts() { ProductId = productId, WarehouseId = info.FromId, Quantity = 0 };
        context.WarehouseProducts.Add(@from);
      }
      @from.Quantity += info.Quantity;

      using var transaction = context.Database.BeginTransaction();
      try
      {
        context.SaveChanges();

        var date = DateTime.UtcNow;
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

    public void TransferProduct(string userId, int productId, ApiProdTransfer info)
    {
      using var context = _di.GetRequiredService<ApplicationDbContext>();
      var from = getStockAndVerify(productId, info, context);

      using var transaction = context.Database.BeginTransaction();
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

        var date = DateTime.UtcNow;
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

    #endregion

    #region OrderManagement
    public async Task SellOrderAsync(string userId, ApiSellOrder info)
    {
      var changesNotes = new List<ApiProdCountChange>();
      await _semaphoreSlim.WaitAsync();
      try
      {
        await using var context = _di.GetRequiredService<ApplicationDbContext>();
        await using var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);

        var date = DateTime.UtcNow;
        var order = _mapper.Map<Order>(info);
        order.OpenDate = date;
        order.Status = OrderStatus.Open;
        order.Delivery = info.Delivery;
        order.ResponsibleUserId = userId;
        order.Transactions = new List<ProductAction>();

        var (orderTransactions, notes) = createAddOrderProductActions(info.ProductOrders, context, userId, date);
        changesNotes.AddRange(notes);
        order.Transactions.AddRange(orderTransactions);

        context.Orders.Add(order);
        await context.SaveChangesAsync();

        await transaction.CommitAsync();
        await Informer.ProductsCountChangedAsync(changesNotes).ConfigureAwait(false);
      }
      finally
      {
        _semaphoreSlim.Release();
      }
    }

    public async Task EditSellOrderAsync(string userId, ApiEditSellOrder command)
    {
      var date = DateTime.UtcNow;
      var changesNotes = new List<ApiProdCountChange>();
      await _semaphoreSlim.WaitAsync();
      try
      {
        await using var context = _di.GetRequiredService<ApplicationDbContext>();
        await using var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
        var existingOrder = await context.Orders
          .Include(it => it.OrderEditions)
          .Include(it => it.Transactions)
          .Where(it => it.Id == command.Id).FirstOrDefaultAsync();

        if (existingOrder == null) throw new Exception("Замовлення не знайдено");
        if (existingOrder.Status != OrderStatus.Open) throw new Exception("Лише відкриті замовілення можна редашувати");

        var existingProducts = existingOrder.Transactions;
        var currentProducts = command.ProductOrders.ToList();

        // completely new products that did not exist previously, warehouses are in play
        var newProducts = currentProducts.Where(cp => !existingProducts.Any(ep => ep.ProductId == cp.IdProduct && ep.WarehouseId == cp.FromId))
          .ToList();
        // products that were removed from order
        var actionsToRevert = existingProducts.Where(ep => !currentProducts.Any(cp => ep.ProductId == cp.IdProduct && ep.WarehouseId == cp.FromId))
          .ToList();
        // product whose quantity was changed
        var quantityChanges = existingProducts.Where(ep =>
        {
          var cp = currentProducts.FirstOrDefault(cp => ep.ProductId == cp.IdProduct && ep.WarehouseId == cp.FromId);
          if(cp == null) return false;
          var existingQuantity = -1 * ep.Quantity; // existing quantity is saved with -, so e.g. -1
          if (existingQuantity == cp.Quantity) return false; // current quantity is provided as desired sale amount, e.g +2
          var change = cp.Quantity - existingQuantity; // so we take 2 items we want to have - 1 we already have and receive 1 we need to sell
          // or we may get 1 we have, had 2 so we need to restore 1 item.
          ep.Quantity = change * -1; // revert changes action is going to revert this value
          return true;
        }).ToList();
        actionsToRevert.AddRange(quantityChanges);


        var (addTransactions, addNotes) = createAddOrderProductActions(newProducts, context, userId, date);
        var (removeTransactions, removeNotes) = await createRevertOrderProductActionsAsync(actionsToRevert, $"Відредаговано замовлення {command.Id}", context, userId, date);
        existingOrder.Transactions.AddRange(addTransactions);
        existingOrder.Transactions.AddRange(removeTransactions);
        changesNotes.AddRange(addNotes);
        changesNotes.AddRange(removeNotes);

        await context.SaveChangesAsync();

        await transaction.CommitAsync();


        await Informer.ProductsCountChangedAsync(changesNotes).ConfigureAwait(false);
      }
      finally
      {
        _semaphoreSlim.Release();
      }
    }

    public async Task<bool> CancelOrderAsync(string userId, int id, string reason)
    {
      var changesNotes = new List<ApiProdCountChange>();
      var date = DateTime.UtcNow;
      await using var context = _di.GetRequiredService<ApplicationDbContext>();
      await using var transaction = await context.Database.BeginTransactionAsync();
      var order = await context.Orders.Include(it => it.Transactions)
        .FirstOrDefaultAsync(it => it.Id == id).ConfigureAwait(false);

      if (order.Status == OrderStatus.Canceled) throw new ArgumentException("Поточне замовлення уже скасовано");
      order.Status = OrderStatus.Canceled;
      order.CloseDate = date;
      order.CanceledDate = date;
      order.CanceledByUserId = userId;
      order.CancelReason = reason;

      var message = $"Скасовано замовлення {id}";
      var (revertActions, notes) = await createRevertOrderProductActionsAsync(order.Transactions, message, context, userId, date);
      order.Transactions.AddRange(revertActions);
      changesNotes.AddRange(notes);

      await context.SaveChangesAsync();
      await transaction.CommitAsync();

      await Informer.ProductsCountChangedAsync(changesNotes).ConfigureAwait(false);

      return true;
    }

    private static async Task<(List<ProductAction>, List<ApiProdCountChange>)> createRevertOrderProductActionsAsync(List<ProductAction> actionsToRevert, string message,
      ApplicationDbContext context, string userId, DateTime date)
    {
      var revertActions = new List<ProductAction>();
      var changesNotes = new List<ApiProdCountChange>();

      var warehouses = await context.WarehouseProducts.Include(it => it.Product).ToListAsync();
      foreach (var action in actionsToRevert)
      {
        var from = warehouses.FirstOrDefault(it => it.ProductId == action.ProductId && it.WarehouseId == action.WarehouseId);
        var oldCount = from.Quantity;
        from.Quantity += action.Quantity * -1; // quantity is negative in sale action

        changesNotes.Add(new ApiProdCountChange
        {
          ProductId = action.ProductId,
          WarehouseId = from.WarehouseId,
          NewCount = from.Quantity,
          OldCount = oldCount
        });

        var restoreAction = new ProductAction
        {
          Date = date,
          ProductId = action.ProductId,
          Quantity = -action.Quantity, // quantity is negative in sale action
          WarehouseId = action.WarehouseId,
          Description = message,
          Price = action.Price,
          BuyPrice = from.Product.RecommendedBuyPrice,
          UserId = userId,
          Operation = OperationDescription.TransferAdd,
        };
        revertActions.Add(restoreAction);
      }

      return (revertActions, changesNotes);
    }

    private static (List<ProductAction>, List<ApiProdCountChange>) createAddOrderProductActions(IEnumerable<ApiProdSell> products, ApplicationDbContext context,
      string userId, DateTime date)
    {
      var changesNotes = new List<ApiProdCountChange>();
      var transactions = new List<ProductAction>();
      foreach (var productOrder in products)
      {
        var from = getStockAndVerify(productOrder.IdProduct, productOrder, context);

        changesNotes.Add(new ApiProdCountChange
        {
          ProductId = productOrder.IdProduct,
          WarehouseId = productOrder.FromId,
          NewCount = from.Quantity,
          OldCount = from.Quantity + productOrder.Quantity
        });

        var productAction = new ProductAction
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
        transactions.Add(productAction);
      }
      return (transactions, changesNotes);
    }

    private static WarehouseProducts getStockAndVerify(int productId, ApiProdAction info, ApplicationDbContext context)
    {
      var from = context.WarehouseProducts.Include(it => it.Product).FirstOrDefault(it => it.ProductId == productId && it.WarehouseId == info.FromId);
      if (from == null) throw new ArgumentException($"Товар з ID {productId} не знайдено на складі");
      if (from.Quantity < info.Quantity) throw new ArgumentException($"Не достатньо товарів на складі для здійстення продажі (ProductID: {from.Product.ProductType} - {from.Product.Model})");
      from.Quantity -= info.Quantity;
      return from;
    }


    #endregion




  }
}
