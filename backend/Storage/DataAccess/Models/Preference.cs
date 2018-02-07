using System;
using System.Collections.Generic;
using System.Text;

namespace DataAccess.Models
{
  public class Preference
  {
    public int Id { get; set; }
    public string UserId { get; set; }
    public string Key { get; set; }
    public string Value { get; set; }

    public ApplicationUser User { get; set; }
  }
}
