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
using Bv.Meter.WebApp.Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

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
    Task SellOrderAsync(string userId, ApiSellOrder command);

    Task SelfSellOrderAsync(string userId, MakeSelfOrderCommand command);
    Task EditSellOrderAsync(string userId, ApiEditSellOrder command);
    Task<bool> CancelOrderAsync(string userId, int id, string reason);
  }

  public class WarehousesRepository : IWarehouseRepository
  {

    private readonly IServiceProvider _di;
    private readonly IMapper _mapper;
    private readonly IStateService _state;
    static readonly SemaphoreSlim _semaphoreSlim = new(1, 1);

    IStateInformer Informer => _di.GetService<IStateInformer>();

    public WarehousesRepository(IServiceProvider serviceProvider, IConfiguration configuration, IMapper mapper)
    {
      _di = serviceProvider;
      _mapper = mapper;
      _state = serviceProvider.GetRequiredService<IStateService>();
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
      using var context = _di.GetRequiredService<ApplicationDbContext>();
      var product = context.Warehouses.Find(id);
      if (product == null) return;
      product.IsActive = false;
      context.SaveChanges();
    }

    #endregion

    #region Product +-

    public void RemoveProduct(string userId, int productId, ApiProdAction info)
    {
      using var context = _di.GetRequiredService<ApplicationDbContext>();
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
          Operation = OperationDescription.Delete,
          DiscountMultiplier = 1
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
      using var context = _di.GetRequiredService<ApplicationDbContext>();
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
          DiscountMultiplier = 1
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
          DiscountMultiplier = 1
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
          DiscountMultiplier = 1
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
    public async Task SellOrderAsync(string userId, ApiSellOrder command)
    {
      var changesNotes = new List<ApiProdCountChange>();
      await _semaphoreSlim.WaitAsync();
      try
      {
        await using var context = _di.GetRequiredService<ApplicationDbContext>();
        await using var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);


        var isValid = await verifyOrderIntegrityAsync(context, command.DiscountMultiplier, command.ProductOrders, userId);
        if (!isValid) throw new ApiException("Зазначена знижка не доступна для користувача");

        var date = DateTime.UtcNow;
        var order = _mapper.Map<Order>(command);
        order.OpenDate = date;
        order.Status = OrderStatus.Open;
        order.Delivery = command.Delivery;
        order.ResponsibleUserId = userId;
        order.Transactions = new List<ProductAction>();

        var productOrders = command.ProductOrders.Select(it => new ProductRequest()
        {
          ProductId = it.IdProduct,
          FromId = it.FromId,
          Description = it.Description,
          Price = it.Price,
          DiscountMultiplier = it.DiscountMultiplier,
          Quantity = it.Quantity
        }).ToList();

        var (orderTransactions, notes) = createAddOrderProductActions(productOrders, context, userId, date);
        changesNotes.AddRange(notes);
        order.Transactions.AddRange(orderTransactions);
        changesNotes.AddRange(notes);
        order.Transactions.AddRange(orderTransactions);

        context.Orders.Add(order);

        var revision = await _state.UpdateProductsStateCounterAsync(context);

        await context.SaveChangesAsync();
        await transaction.CommitAsync();
        await Informer.ProductsCountChangedAsync(changesNotes, revision).ConfigureAwait(false);
      }
      finally
      {
        _semaphoreSlim.Release();
      }
    }

    public async Task SelfSellOrderAsync(string userId, MakeSelfOrderCommand command)
    {
      var changesNotes = new List<ApiProdCountChange>();
      await _semaphoreSlim.WaitAsync();
      try
      {
        await using var context = _di.GetRequiredService<ApplicationDbContext>();
        await using var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);


        var isValid = await verifyOrderIntegrityAsync(context, command.DiscountMultiplier, command.ProductOrders, userId);
        if (!isValid) throw new ApiException("Зазначена знижка не доступна для користувача");

        var clientInfo = await context.Users.FindAsync(userId);
        if (clientInfo == null || clientInfo.IsActive == false) throw new ApiException("Не існуючий або деактивований користувач");
        var date = DateTime.UtcNow;
        //  _mapper.Map<Order>(command);
        var order = new Order
        {
          OpenDate = date,
          Status = OrderStatus.Open,
          Delivery = DeliveryKind.Drop,
          Payment = PaymentKind.Payed,
          
          ResponsibleUserId = userId,
          ClientAddress = clientInfo.DropAddress ?? $"{clientInfo.Surname} {clientInfo.Name}",
          ClientName = $"{clientInfo.Surname} {clientInfo.Name}",
          ClientPhone = clientInfo.Phone,
          TrackingNumber = command.OrderNumber,
          Other = command.Other,
          DiscountMultiplier = command.DiscountMultiplier,
          Transactions = new List<ProductAction>()
        };

        var productOrders = command.ProductOrders.Select(it => new ProductRequest()
        {
          ProductId = it.IdProduct,
          FromId = it.FromId,
          Description = it.Description,
          Price = it.Price,
          DiscountMultiplier = it.DiscountMultiplier,
          Quantity = it.Quantity
        }).ToList();

        var (orderTransactions, notes) = createAddOrderProductActions(productOrders, context, userId, date);
        changesNotes.AddRange(notes);
        order.Transactions.AddRange(orderTransactions);
        changesNotes.AddRange(notes);
        order.Transactions.AddRange(orderTransactions);

        context.Orders.Add(order);

        var revision = await _state.UpdateProductsStateCounterAsync(context);

        await context.SaveChangesAsync();
        await transaction.CommitAsync();
        await Informer.ProductsCountChangedAsync(changesNotes, revision).ConfigureAwait(false);
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


        var isValid = await verifyOrderIntegrityAsync(context, command.DiscountMultiplier, command.ProductOrders, userId);
        if (!isValid) throw new ApiException("Зазначена знижка не доступна для користувача");

        var existingOrder = await context.Orders
          .Include(it => it.OrderEditions)
          .Include(it => it.Transactions)
          .Where(it => it.Id == command.Id).FirstOrDefaultAsync();

        if (existingOrder == null) throw new Exception("Замовлення не знайдено");
        if (existingOrder.Status != OrderStatus.Open) throw new Exception("Лише відкриті замовілення можна редашувати");

        context.OrderAction.Add(new OrderAction
        {
          Date = DateTime.UtcNow,
          OrderId = existingOrder.Id,
          UserId = userId,
          Note = $"Змінено набір товарів",
          Operation = OrderOperation.ProductsEdited,
          OrderJson = JsonConvert.SerializeObject(command)
        });

        // I assume that 99% of time there is going to be just a single item per product
        // only possible case is when we already have removed some items and re-added those, or when we were already changing quantities
        var existingProducts = existingOrder.Transactions.GroupBy(it => new { it.WarehouseId, it.ProductId, it.Price })
          .Select(it => new ProductRequest()
          {
            FromId = it.Key.WarehouseId,
            ProductId = it.Key.ProductId,
            Price = it.Key.Price,
            Quantity = it.Sum(p => p.Quantity),
            Description = null, // we do not modify existing records, so we are not interested in this field
          }).Where(it => it.Quantity != 0)
          .ToList();

        var currentProducts = command.ProductOrders.ToList();

        // completely new products that did not exist previously, warehouses are in play
        var newProducts = currentProducts
          .Where(cp => !existingProducts.Any(ep => ep.ProductId == cp.IdProduct && ep.FromId == cp.FromId))
          .Select(it => new ProductRequest()
          {
            Quantity = it.Quantity,
            Description = it.Description,
            Price = it.Price,
            ProductId = it.IdProduct,
            FromId = it.FromId,
            DiscountMultiplier = it.DiscountMultiplier,
          }).ToList();
        // products that were removed from order
        var actionsToRevert = existingProducts
          .Where(ep => !currentProducts.Any(cp => ep.ProductId == cp.IdProduct && ep.FromId == cp.FromId))
          .ToList();
        // product whose quantity was changed
        var productsWithQuantityChanges =
          existingProducts.Where(ep =>
          {
            var cp = currentProducts.FirstOrDefault(cp => ep.ProductId == cp.IdProduct && ep.FromId == cp.FromId);
            if (cp == null) return false;
            var existingQuantity = -1 * ep.Quantity; // existing quantity is saved with -, so e.g. -1
            return (existingQuantity != cp.Quantity);
          }).ToList();



        var message = $"Відредаговано замовлення {command.Id}";
        productsWithQuantityChanges.ForEach(ep =>
        {
          // the same product with the same discount
          var cp = currentProducts.First(cp => ep.ProductId == cp.IdProduct && ep.FromId == cp.FromId
                                                                            && ep.DiscountMultiplier == cp.DiscountMultiplier);
          var existingQuantity = -1 * ep.Quantity; // existing quantity is saved with -, so e.g. -1
          var change = cp.Quantity - existingQuantity; // so we take 2 items we want to have - 1 we already have and receive 1 we need to sell
          var action = new ProductRequest()
          {
            Quantity = change,
            Description = message,
            Price = cp.Price,
            ProductId = cp.IdProduct,
            FromId = cp.FromId,
            DiscountMultiplier = cp.DiscountMultiplier,
          };
          if (change > 0)
          {
            newProducts.Add(action);
          }
          else
          {
            actionsToRevert.Add(action); // negative quantity will be reverted to positive one
          }
        });

        var (addTransactions, addNotes) = createAddOrderProductActions(newProducts, context, userId, date);
        var (removeTransactions, removeNotes) = await createRevertOrderProductActionsAsync(actionsToRevert, $"Відредаговано замовлення {command.Id}", context, userId, date);

        if (addTransactions.Count == 0 && removeTransactions.Count == 0)
        {
          await transaction.RollbackAsync();
          return;
        }

        existingOrder.Transactions.AddRange(addTransactions);
        existingOrder.Transactions.AddRange(removeTransactions);
        changesNotes.AddRange(addNotes);
        changesNotes.AddRange(removeNotes);

        var revision = await _state.UpdateProductsStateCounterAsync(context);

        await context.SaveChangesAsync();
        await transaction.CommitAsync();


        await Informer.ProductsCountChangedAsync(changesNotes, revision).ConfigureAwait(false);
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

      // I assume that 99% of time there is going to be just a single item per product
      // only possible case is when we already have removed some items and re-added those, or when we were already changing quantities
      var actionsToRevert = order.Transactions.GroupBy(it => new { it.WarehouseId, it.ProductId, it.Price, it.DiscountMultiplier })
        .Select(it => new ProductRequest()
        {
          FromId = it.Key.WarehouseId,
          ProductId = it.Key.ProductId,
          Price = it.Key.Price,
          DiscountMultiplier = it.Key.DiscountMultiplier,
          Quantity = it.Sum(p => p.Quantity),
          Description = null, // we do not modify existing records, so we are not interested in this field
        }).Where(it => it.Quantity != 0).ToList(); // we want to revert only those products that have some quantities 

      var message = $"Скасовано замовлення {id}";
      var (revertActions, notes) = await createRevertOrderProductActionsAsync(actionsToRevert, message, context, userId, date);
      order.Transactions.AddRange(revertActions);
      changesNotes.AddRange(notes);

      var revision = await _state.UpdateProductsStateCounterAsync(context);

      await context.SaveChangesAsync();
      await transaction.CommitAsync();

      await Informer.ProductsCountChangedAsync(changesNotes, revision).ConfigureAwait(false);

      return true;
    }

    private static async Task<(List<ProductAction>, List<ApiProdCountChange>)> createRevertOrderProductActionsAsync(List<ProductRequest> actionsToRevert, string message,
      ApplicationDbContext context, string userId, DateTime date)
    {
      var revertActions = new List<ProductAction>();
      var changesNotes = new List<ApiProdCountChange>();

      var warehouses = await context.WarehouseProducts.Include(it => it.Product).ToListAsync();
      foreach (var action in actionsToRevert)
      {
        var from = warehouses.FirstOrDefault(it => it.ProductId == action.ProductId && it.WarehouseId == action.FromId);
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
          WarehouseId = action.FromId,
          Description = message,
          Price = action.Price,
          DiscountMultiplier = action.DiscountMultiplier,
          BuyPrice = from.Product.RecommendedBuyPrice,
          UserId = userId,
          Operation = OperationDescription.TransferAdd,
        };
        revertActions.Add(restoreAction);
      }

      return (revertActions, changesNotes);
    }



    private static (List<ProductAction>, List<ApiProdCountChange>) createAddOrderProductActions(
      IEnumerable<ProductRequest> products, ApplicationDbContext context,
      string userId, DateTime date)
    {
      var changesNotes = new List<ApiProdCountChange>();
      var transactions = new List<ProductAction>();
      foreach (var productOrder in products)
      {
        var from = getStockAndVerify(productOrder.ProductId, productOrder, context);

        changesNotes.Add(new ApiProdCountChange
        {
          ProductId = productOrder.ProductId,
          WarehouseId = productOrder.FromId,
          NewCount = from.Quantity,
          OldCount = from.Quantity + productOrder.Quantity
        });

        var productAction = new ProductAction
        {
          Date = date,
          ProductId = productOrder.ProductId,
          Quantity = -productOrder.Quantity,
          WarehouseId = productOrder.FromId,
          Description = productOrder.Description,
          Price = productOrder.Price,
          DiscountMultiplier = productOrder.DiscountMultiplier,
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

    private static async Task<bool> verifyOrderIntegrityAsync(ApplicationDbContext context, double discountMultiplier,
      IEnumerable<ApiProdSell> productOrders, string userId)
    {
      var userDiscounts = await context.UserDiscounts.Where(it => it.UserId == userId)
        .Select(it => it.DiscountMultiplier)
        .ToListAsync();
      userDiscounts.Add(1.0); // no discount option is always on the table
      // we need to check that user can actually apply discounts levels to the order
      if (!userDiscounts.Contains(discountMultiplier)) return false;
      if (productOrders.Any(po => !userDiscounts.Contains(po.DiscountMultiplier))) return false;
      return true;
    }

    private class ProductRequest : ApiProdAction
    {
      public double Price { get; init; }

      public double DiscountMultiplier { get; init; }
      public int ProductId { get; init; }
    }

    #endregion

  }
}
