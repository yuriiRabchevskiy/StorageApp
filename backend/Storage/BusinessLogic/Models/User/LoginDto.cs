using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.Models.User
{
  public static class UserRole
  {
    public const string Admin = "Admin";
    public const string AdminAssistant = nameof(AdminAssistant);
    public const string User = "User";
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
    public bool IsAdminAssistant { get; set; } = false;
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
    public bool IsAdminAssistant { get; set; } = false;
  }

  public class ForgotPasswordModel
  {
    public string Email { get; set; }
  }

  public class ChangePasswordModel
  {
    public string CurrentPassword;
    public string NewPassword;
  }


}
