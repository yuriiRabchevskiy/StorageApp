using AutoMapper;
using BusinessLogic.Models.Api;
using BusinessLogic.Models.Api.Reports;
using DataAccess.Models;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using BusinessLogic.Models.Api.Client;

namespace Storage.Code
{
  public static class StorageConfiguration
  {
    static public void SetupAutoMapper(this IServiceCollection services)
    {
      var config = new MapperConfiguration(cfg =>
      {
        cfg.CreateMap<ApiProdAction, ApiProdSell>();
        cfg.CreateMap<Order, ApiClientOrder>()
          .ForMember(it => it.OrderNumber, opt => opt.MapFrom(src => src.TrackingNumber));
        cfg.CreateMap<Order, ApiOrder>()
          .ForMember(it => it.OrderNumber, opt => opt.MapFrom(src => src.TrackingNumber));
        cfg.CreateMap<ApiOrder, Order>()
          .ForMember(it => it.TrackingNumber, opt => opt.MapFrom(src => src.OrderNumber));
        cfg.CreateMap<ApiSellOrder, Order>()
          .ForMember(it => it.TrackingNumber, opt => opt.MapFrom(src => src.OrderNumber));
        cfg.CreateMap<OrderAction, ApiOrderAction>().ReverseMap();
        cfg.CreateMap<ApplicationUser, ApiUser>()
          .ForMember(it => it.Login, opt => opt.MapFrom(src => src.UserName))
          .ForMember(it => it.DiscountMultipliers, opt => opt.Ignore());
        cfg.CreateMap<ApiUser, ApplicationUser>()
          .ForMember(it => it.UserName, opt => opt.MapFrom(src => src.Login))
          .ForMember(it => it.Discounts, opt => opt.Ignore());
        cfg.CreateMap<Category, ApiCategory>();
        cfg.CreateMap<ApiCategory, Category>();
        cfg.CreateMap<Product, ApiProduct>();
        cfg.CreateMap<Product, ApiClientProduct>();
        cfg.CreateMap<ApiProduct, Product>();
        cfg.CreateMap<Warehouse, ApiWarehouse>();
        cfg.CreateMap<ApiWarehouse, Warehouse>();
        cfg.CreateMap<ApiWarehouseAction, ProductAction>();
        cfg.CreateMap<ProductAction, ApiWarehouseAction>();
        cfg.CreateMap<ApiProduct, CsvProduct>()
          .ForMember(it => it.TotalBalance, opt => opt.MapFrom(src => src.Balance.Keys.Select(key => src.Balance[key]).Sum()))
          .ForMember(it => it.Price, opt => opt.MapFrom(src => src.RecommendedSalePrice));
      });
      var mapper = config.CreateMapper();
      services.AddSingleton(mapper);
    }
  }
}
