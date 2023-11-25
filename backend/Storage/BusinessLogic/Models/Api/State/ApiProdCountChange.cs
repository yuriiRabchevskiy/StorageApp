using System.Collections.Generic;

namespace BusinessLogic.Models.Api.State
{

  public class ApiProdCountChanges
  {
    public int StateRevision { get; set; }
    public IEnumerable<ApiProdCountChange> Changes { get; set; }
  }


  public class ApiProdCountChange
  {
    public int ProductId { get; set; }
    public int WarehouseId { get; set; }
    public int NewCount { get; set; }
    public int OldCount { get; set; }
  }
}
