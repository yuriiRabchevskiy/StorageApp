using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Models
{
  public class ApplicationState
  {
    public int Id { get; set; }
    public int ProductsRevision { get; set; }
    public int OrdersRevision { get; set; }
  }
}
