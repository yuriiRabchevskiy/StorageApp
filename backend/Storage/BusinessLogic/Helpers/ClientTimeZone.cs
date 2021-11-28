using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLogic.Helpers
{
  public class ClientTimeZone
  {
    private TimeSpan _tzOffset;
    public DateTime UtcNow
    {
      get { return DateTime.UtcNow; }
    }

    public ClientTimeZone()
    {
    }
  }
}
