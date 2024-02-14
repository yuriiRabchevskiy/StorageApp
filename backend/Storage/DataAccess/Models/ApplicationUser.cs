using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace DataAccess.Models
{
  public class ApplicationUser : IdentityUser
  {
    public string Name { get; set; }
    public string Surname { get; set; }
    public string Phone { get; set; }
    public string Notes { get; set; }
    public bool IsActive { get; set; }

    public string DropAddress { get; set; }

    public ICollection<UserDiscount> Discounts { get; set; }
  }
}
