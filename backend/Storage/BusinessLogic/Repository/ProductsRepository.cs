using System;
using System.Collections.Generic;
using System.Linq;
using DataAccess.Models;
using BusinessLogic.Models.Api;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Repository
{
  public interface IProductsRepository
  {
    List<ApiProduct> Get();
    int Add(ApiProduct product);
    void Update(ApiProduct product);
    void Delete(int productId);
  }

  public class ProductsRepository : IProductsRepository
  {

    private IServiceProvider _di;

    public ProductsRepository(IServiceProvider serviceProvider)
    {
      _di = serviceProvider;
    }

    public List<ApiProduct> Get()
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        return context.Products.Where(it => it.IsActive).Include(it => it.State).ToList().Select(it =>
        {
          var prod = Mapper.Map<ApiProduct>(it);
          prod.Balance = it.State.ToDictionary(key => key.WarehouseId, val => val.Quantity);
          return prod;
        }).OrderByDescending(it=> it.Balance.Values.Sum() > 0 ).ToList();
      }
    }

    public int Add(ApiProduct it)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var product = Mapper.Map<Product>(it);
        it.IsActive = true;
        context.Products.Add(product);
        context.SaveChanges();
        return product.Id;
      }

    }

    public void Update(ApiProduct it)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var real = context.Products.Find(it.Id);
        if (real != null)
        {
          real.Color = it.Color;
          real.CategoryId = it.CategoryId;
          real.FreeNote = it.FreeNote;
          real.Model = it.Model;
          real.Producer = it.Producer;
          real.ProductType = it.ProductType;
          real.RecommendedBuyPrice = it.RecommendedBuyPrice;
          real.RecommendedSalePrice = it.RecommendedSalePrice;
          real.Size = it.Size;
        }
        context.SaveChanges();
      }
    }

    public void Delete(int productId)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var product = context.Products.Find(productId);
        if (product == null) return;

        product.IsActive = false;
        context.SaveChanges();

      }
    }

  }
}
