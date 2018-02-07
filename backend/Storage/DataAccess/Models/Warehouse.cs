using System.Collections.Generic;

namespace DataAccess.Models
{
  public class Warehouse
  {
    public int Id { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }

    public ICollection<Product> Products { get; set; }
  }
}
