using System;
namespace BusinessLogic.Helpers
{
  public static class DateExtension
  {
    public static DateTime? ToDateTime(this long? ms)
    {
      if (ms == null) return null;
      return new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds(ms.Value);
    }

    public static DateTime ToDateTime(this long ms)
    {
      return new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds(ms);
    }

  }
}
