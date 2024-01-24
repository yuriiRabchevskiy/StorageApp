using DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLogic.Helpers
{
  public static class ProductActionExtensions
  {
    private static readonly Dictionary<OperationDescription, string> _translations = new()
    {
      [OperationDescription.StockRenew] = "Поповненя на склад",
      [OperationDescription.Delete] = "Вилучення зі складу",
      [OperationDescription.TransferAdd] = "На склад",
      [OperationDescription.TransferRemove] = "Зі складу",
      [OperationDescription.Sold] = "Продано",

    };

    public static string GetOperationString(this ProductAction product)
    {
      return _translations[product.Operation];
    }
  }
}
