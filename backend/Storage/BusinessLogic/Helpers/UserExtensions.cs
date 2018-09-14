using DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLogic.Helpers
{
  public static class UserExtensions
  {
    public static string BuildFullName(this ApplicationUser user)
    {
      var prefix = string.IsNullOrEmpty(user.Surname) ? "" : user.Surname + " ";
      return prefix + user.Name; ;
    }
  }
}
