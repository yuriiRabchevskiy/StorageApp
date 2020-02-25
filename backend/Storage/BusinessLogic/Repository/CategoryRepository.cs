using System;
using System.Collections.Generic;
using System.Linq;
using DataAccess.Models;
using BusinessLogic.Models.Api;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;

namespace DataAccess.Repository
{
  public interface ICategoriesRepository
  {
    List<ApiCategory> Get();
    int Add(ApiCategory product);
    void Update(ApiCategory product);
    void Delete(int productId);
  }

  public class CategoriesRepository : ICategoriesRepository
  {

    private IServiceProvider _di;
    private readonly IMapper _mapper;

    public CategoriesRepository(IServiceProvider serviceProvider, IMapper mapper)
    {
      _di = serviceProvider;
      _mapper = mapper;
    }

    public List<ApiCategory> Get()
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        return context.Categories.Where(it => it.IsActive).ToList().Select(_mapper.Map<ApiCategory>).ToList();
      }
    }

    public int Add(ApiCategory it)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        it.IsActive = true;
        var category = _mapper.Map<Category>(it);
        context.Categories.Add(category);
        context.SaveChanges();
        return category.Id;
      }

    }

    public void Update(ApiCategory it)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var real = context.Categories.Find(it.Id);
        if (real != null)
        {
          real.Name = it.Name;
        }
        context.SaveChanges();
      }
    }

    public void Delete(int productId)
    {
      using (var context = _di.GetService<ApplicationDbContext>())
      {
        var product = context.Categories.Find(productId);
        if (product == null) return;

        product.IsActive = false;
        context.SaveChanges();

      }
    }

  }
}
