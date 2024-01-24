using DataAccess.Models;
using System;
using System.Collections.Generic;

namespace BusinessLogic.Models.Api
{
  public class ApiOrder
  {
    public int Id { get; set; }
    public string ClientPhone { get; set; }
    public string ClientName { get; set; }
    public string ClientAddress { get; set; }
    public string OrderNumber { get; set; }
    public string Other { get; set; }
    public OrderStatus? Status { get; set; }
    public PaymentKind Payment { get; set; }

    public DeliveryKind Delivery { get; set; }
    public DateTime? OpenDate { get; set; }
    public DateTime? CloseDate { get; set; }
    public double? TotalPrice { get; set; }

    public double? TotalDiscount { get; set; }
    public double? TotalBuyPrice { get; set; }
    public string Seller { get; set; }
    public string CanceledBy { get; set; }
    public string CancelReason { get; set; }
    public DateTime? CancelDate { get; set; }

    public double DiscountMultiplier { get; set; }

    public IEnumerable<ApiProdOrder> Products { get; set; }
  }
}
