using System.Collections.Generic;

namespace BusinessLogic.Models.Api.Client
{
  public class ApiClientProduct
  {
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string ProductCode { get; set; }
    public string ProductType { get; set; } // e.g. backpack, stairs
    public string Model { get; set; } // e.g. backpack, stairs
    public string Producer { get; set; }
    public string Color { get; set; }
    public string Size { get; set; }
    public string FreeNote { get; set; }
    public bool IsActive { get; set; }
  }

}
