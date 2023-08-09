using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;

namespace BusinessLogic.Models.User
{

  public static class UserRole
  {
    public const string Admin = nameof(Admin);
    public const string AdminAssistant = nameof(AdminAssistant);
    public const string User = nameof(User);
    public const string Client = nameof(Client);
    public const string WarhouseManager = nameof(WarhouseManager);
    public const string AllSales = "AdminAssistant, Admin, User";

    public static List<string> SupportedRoles = new List<string>(new[]
    {
      Admin, Client, AdminAssistant, User
    });

    public static bool IsSupportedRole(string role)
    {
      return SupportedRoles.Contains(role);
    }
  }




  public class LoginDto
  {
    [Required]
    public string Login { get; set; }

    [Required]
    public string Password { get; set; }

  }

  public class UserDto
  {
    [Required]
    public string Login { get; set; }

    [Required]
    public string Email { get; set; }

    public string Name { get; set; }
    public string Notes { get; set; }
    public string Surname { get; set; }
    public string Phone { get; set; }
    public bool IsAdmin { get; set; } = false;
    public string Role { get; set; } = User.UserRole.User;
  }

  public class RegisterDto : UserDto
  {
    [Required]
    [StringLength(100, ErrorMessage = "PASSWORD_MIN_LENGTH", MinimumLength = 6)]
    public string Password { get; set; }
  }

  public class LoginResult
  {
    public string Token { get; set; }
    public string UserName { get; set; }
    public bool IsAdmin { get; set; } = false;
    public string Role { get; set; } = User.UserRole.User;
  }

  public class ForgotPasswordModel
  {
    public string Email { get; set; }
  }

  public class ChangePasswordModel
  {
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
  }


}
