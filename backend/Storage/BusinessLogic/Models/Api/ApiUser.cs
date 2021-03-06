using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLogic.Models.Api
{
  public class ApiUser
  {
    public string Id { get; set; }
    public string Login { get; set; }
    public string Name { get; set; }
    public string Surname { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string Notes { get; set; }
    public string Password { get; set; }
    public bool IsActive { get; set; }
    public bool IsAdmin { get; set; }
  }
}
