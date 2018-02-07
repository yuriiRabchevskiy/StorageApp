
using System;
using System.Collections.Generic;

namespace DataAccess.Models
{
  public enum OrderStatus { Open, Closed, Processing, Canceled }
  public enum PaymentKind { Payed, CashOnDelivery }

  public class Order
  {
    public int Id { get; set; }
    public string ResponsibleUserId { get; set; }
    public string ClientPhone { get; set; }
    public string ClientName { get; set; }
    public string ClientAddress { get; set; }
    public long? OrderNumber { get; set; }
    public string Other { get; set; }
    public OrderStatus Status { get; set; }
    public PaymentKind Payment { get; set; }
    public DateTime OpenDate { get; set; }
    public DateTime? CloseDate { get; set; }
    public DateTime? CanceledDate { get; set; }
    public string CancelReason { get; set; }
    public string CanceledByUserId { get; set; }

    public List<ProductAction> Transactions { get; set; }
    public ApplicationUser ResponsibleUser { get; set; }
    public ApplicationUser CanceledByUser { get; set; }
  }
}
