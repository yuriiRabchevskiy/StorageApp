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
        api.TotalPrice = ord.Transactions?.Sum(trn => -trn.Price * trn.Quantity);
        api.TotalBuyPrice = ord.Transactions?.Sum(trn => -trn.BuyPrice * trn.Quantity);
        api.Products = ord.Transactions?.Select(it => new ApiProdOrder
        {
          Price = it.Price,
          Quantity = -it.Quantity,
          BuyPrice = it.BuyPrice,
          Product = mapper.Map<ApiProduct>(it.Product),
          TotalPrice = -it.Price * it.Quantity
        }).ToList();
        return api;
      }).ToList();
    }

  }
}
