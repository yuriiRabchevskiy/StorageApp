using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLogic.Helpers
{
  public class ClientTimeZone
  {
    private TimeSpan _tzOffset;
    public DateTime Now
    {
      get { return DateTime.Now.Add(_tzOffset); }
    }

    public ClientTimeZone(string clientTz = "2")
    {
      clientTz = clientTz ?? "2";
      if (!int.TryParse(clientTz, out var hours))
      {
        hours = 2;
      }
      _tzOffset = TimeSpan.FromHours(hours);
    }

    public DateTime GetLocal(DateTime d)
    {
      return d.Add(_tzOffset);
    }
  }
}
