using System;
using System.Collections.Generic;
using DataAccess.Models;

namespace BusinessLogic.Models.Api.Client
{
  public class ApiClientOrder
  {
    public int Id { get; set; }
    public string OrderNumber { get; set; }
    public string Other { get; set; }
    public OrderStatus? Status { get; set; }
    public PaymentKind Payment { get; set; }

    public DateTime? OpenDate { get; set; }
    public DateTime? CloseDate { get; set; }
    public double? TotalPrice { get; set; }

    public double? TotalDiscount { get; set; }
    public string CanceledBy { get; set; }
    public string CancelReason { get; set; }
    public DateTime? CancelDate { get; set; }

    public double DiscountMultiplier { get; set; }

    public IEnumerable<ApiClientProdOrder> Products { get; set; }
  }
}
