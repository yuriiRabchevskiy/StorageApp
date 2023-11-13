
using System.Collections.Generic;
using FluentValidation;
using FluentValidation.Attributes;

namespace BusinessLogic.Models.Api
{
  [Validator(typeof(ApiProdActionValidator))]
  public class ApiProdAction
  {
    public int FromId { get; set; }
    public int Quantity { get; set; }
    public string Description { get; set; }
  }

  [Validator(typeof(ApiProdTransferValidator))]
  public class ApiProdTransfer : ApiProdAction
  {
    public int ToId { get; set; }
  }

  [Validator(typeof(ApiProdSellValidator))]
  public class ApiProdSell : ApiProdAction
  {
    public double Price { get; set; }
    public int IdProduct { get; set; }
  }

  [Validator(typeof(ApiSellOrderValidation))]
  public class ApiSellOrder : ApiOrder
  {
    public IEnumerable<ApiProdSell> ProductOrders { get; set; }
  }

  [Validator(typeof(ApiEditSellOrderValidation))]
  public class ApiEditSellOrder
  {
    public int Id { get; set; }
    public IEnumerable<ApiProdSell> ProductOrders { get; set; }
  }

  public class ApiProdActionValidator : AbstractValidator<ApiProdAction>
  {
    public ApiProdActionValidator()
    {
      RuleFor(it => it.FromId).NotEmpty();
      RuleFor(it => it.Quantity).GreaterThan(0);
    }
  }

  public class ApiProdTransferValidator : AbstractValidator<ApiProdTransfer>
  {
    public ApiProdTransferValidator()
    {
      RuleFor(it => it.FromId).NotEmpty().GreaterThan(0);
      RuleFor(it => it.ToId).NotEmpty().GreaterThan(0);
      RuleFor(it => it.Quantity).GreaterThan(0);
    }
  }

  public class ApiProdSellValidator : AbstractValidator<ApiProdSell>
  {
    public ApiProdSellValidator()
    {
      RuleFor(it => it.FromId).NotEmpty().GreaterThan(0);
      RuleFor(it => it.Quantity).GreaterThan(0);
    }
  }

  public class ApiSellOrderValidation : AbstractValidator<ApiSellOrder>
  {
    public ApiSellOrderValidation()
    {
      RuleFor(it => it.ProductOrders).NotEmpty();
    }
  }

  public class ApiEditSellOrderValidation : AbstractValidator<ApiEditSellOrder>
  {
    public ApiEditSellOrderValidation()
    {
      RuleFor(it => it.ProductOrders).NotEmpty();
    }
  }



}
