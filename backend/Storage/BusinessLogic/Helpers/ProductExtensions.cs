using DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLogic.Helpers
{
  public static class ProductExtensions
  {
    public static string BuildFullName(this Product product)
    {
      return $"{product.Size} {product.Color} {product.ProductType} - {product.Model} {product.Producer} - {product.FreeNote}";
    }
  }
}
