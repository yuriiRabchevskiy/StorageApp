using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLogic.Models.Api.State
{
  public class ApiOrderDetailsChanges
  {
    public int StateRevision { get; set; }
    public IEnumerable<ApiOrderDetailsChange> Changes { get; set; }
  }


  public class ApiOrderDetailsChange
  {
    public int OrderId { get; set; }

    public long ChangeTime { get; set; }

    public ApiOrder Order { get; set; }
  }
}
