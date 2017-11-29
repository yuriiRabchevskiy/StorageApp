using System;
using System.Collections.Generic;
using System.Text;

namespace DataAccess.Models
{

  public enum Opearation { Buy, Sell, Discard }

  public class ProductBalance
  {
    public int Id { get; set; }
    public int IdProduct { get; set; }
    public int IdUser { get; set; }
    public double Price { get; set; }
    public DateTime Date { get; set; }
    public Opearation Operation { get; set; }
    public int Quantity { get; set; }

  }
}
