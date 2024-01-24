using AutoMapper;
using BusinessLogic.Models.Api;
using DataAccess.Models;
using System.Collections.Generic;
using System.Linq;

namespace BusinessLogic.Helpers
{
  public static class OrderToApiOrderMapper
  {
    public static List<ApiOrder> ToApi(this List<Order> source, IMapper mapper)
    {
      return source.Select(ord =>
      {
        var api = mapper.Map<ApiOrder>(ord);

        if (ord.Status == OrderStatus.Canceled && ord.CanceledByUser != null)
        {
          api.CanceledBy = ord.CanceledByUser.BuildFullName();
          api.CancelDate = ord.CanceledDate;
        }

        api.Seller = ord.ResponsibleUser?.BuildFullName();
        api.TotalPrice = ord.Transactions?.Sum(trn => -trn.Price * trn.Quantity * trn.DiscountMultiplier);
        api.TotalBuyPrice = ord.Transactions?.Sum(trn => -trn.BuyPrice * trn.Quantity);

        api.Products = ord.Transactions?.GroupBy(it => new { it.WarehouseId, it.ProductId, it.Price, it.BuyPrice, it.DiscountMultiplier })
          .Select(it => new ApiProdOrder
          {
            Price = it.Key.Price,
            Quantity = -it.Sum(x => x.Quantity),
            BuyPrice = it.Key.BuyPrice,
            Product = mapper.Map<ApiProduct>(it.First().Product),
            TotalPrice = -it.Sum(x => x.Price * x.Quantity * x.DiscountMultiplier),
            WarehouseId = it.Key.WarehouseId,
            DiscountMultiplier = it.Key.DiscountMultiplier,
          }).Where(it => it.Quantity != 0).ToList();
        return api;
      }).ToList();
    }

  }
}
