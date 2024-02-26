using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DataAccess.Models;
using BusinessLogic.Models.Api;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Repository
{
  public interface IProductsRepository
  {
    Task<(List<ApiProduct>, int)> GetAsync();
    int Add(ApiProduct product);
    void Update(ApiProduct product);
    void Delete(int productId);
  }

  public class ProductsRepository : IProductsRepository
  {

    private readonly IServiceProvider _di;
    private readonly IMapper _mapper;

    public ProductsRepository(IServiceProvider serviceProvider, IMapper mapper)
    {
      _di = serviceProvider;
      _mapper = mapper;
    }

    public async Task<(List<ApiProduct>, int)> GetAsync()
    {
      await using var context = _di.GetRequiredService<ApplicationDbContext>();

      var products = await context.Products.Where(it => it.IsActive).Include(it => it.State).ToListAsync();
      var data = products.Select(it =>
      {
        var prod = _mapper.Map<ApiProduct>(it);
        prod.Balance = it.State.ToDictionary(key => key.WarehouseId.ToString(), val => val.Quantity);
        return prod;
      }).OrderByDescending(it => it.Balance.Values.Sum() > 0).ToList();

      var state = await context.AppState.FirstAsync();

      return (data, state.ProductsRevision);

    }

    public int Add(ApiProduct it)
    {
      using var context = _di.GetRequiredService<ApplicationDbContext>();
      var product = _mapper.Map<Product>(it);
      it.IsActive = true;
      context.Products.Add(product);
      context.SaveChanges();
      return product.Id;
    }

    public void Update(ApiProduct it)
    {
      using var context = _di.GetRequiredService<ApplicationDbContext>();
      var real = context.Products.Find(it.Id);
      if (real != null)
      {
        real.Color = it.Color;
        real.CategoryId = it.CategoryId;
        real.FreeNote = it.FreeNote;
        real.Model = it.Model;
        real.Producer = it.Producer;
        real.ProductType = it.ProductType;
        real.ProductCode = it.ProductCode;
        real.RecommendedBuyPrice = it.RecommendedBuyPrice;
        real.RecommendedSalePrice = it.RecommendedSalePrice;
        real.ZeroAvailabilityMarker = it.ZeroAvailabilityMarker;
        real.Size = it.Size;
      }
      context.SaveChanges();
    }

    public void Delete(int productId)
    {
      using var context = _di.GetRequiredService<ApplicationDbContext>();
      var product = context.Products.Find(productId);
      if (product == null) return;

      product.IsActive = false;
      context.SaveChanges();
    }

  }
}
