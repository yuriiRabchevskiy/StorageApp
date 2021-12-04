using AutoMapper;
using BusinessLogic.Models.Api;
using BusinessLogic.Models.Api.Reports;
using DataAccess.Models;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;

namespace Storage.Code
{
  public static class StorageConfiguration
  {
    static public void SetupAutoMapper(this IServiceCollection services)
    {
      var config = new MapperConfiguration(cfg =>
      {
        cfg.CreateMap<ApiProdAction, ApiProdSell>();
        cfg.CreateMap<Order, ApiOrder>();
        cfg.CreateMap<ApiSellOrder, Order>();
        cfg.CreateMap<ApiOrder, Order>();
        cfg.CreateMap<OrderAction, ApiOrderAction>().ReverseMap();
        cfg.CreateMap<ApplicationUser, ApiUser>().ForMember(it => it.Login, opt => opt.MapFrom(src => src.UserName));
        cfg.CreateMap<ApiUser, ApplicationUser>().ForMember(it => it.UserName, opt => opt.MapFrom(src => src.Login));
        cfg.CreateMap<Category, ApiCategory>();
        cfg.CreateMap<ApiCategory, Category>();
        cfg.CreateMap<Product, ApiProduct>();
        cfg.CreateMap<ApiProduct, Product>();
        cfg.CreateMap<Warehouse, ApiWarehouse>();
        cfg.CreateMap<ApiWarehouse, Warehouse>();
        cfg.CreateMap<ApiWarehouseAction, ProductAction>();
        cfg.CreateMap<ProductAction, ApiWarehouseAction>();
        cfg.CreateMap<ApiProduct, CsvProduct>().ForMember(it => it.TotalBalance, opt => opt.MapFrom(src =>
        src.Balance.Keys.Select(key => src.Balance[key]).Sum()));
      });
      var mapper = config.CreateMapper();
      services.AddSingleton(mapper);
    }
  }
}
