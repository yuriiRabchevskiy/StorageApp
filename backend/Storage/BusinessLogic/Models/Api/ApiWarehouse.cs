using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLogic.Models.Api
{
  public class ApiWarehouse
  {
    public int Id { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
  }
}
