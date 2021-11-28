using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Authentication;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BusinessLogic.Models.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SharedDataContracts.Api.Response;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using Storage.Code.Services;

namespace Storage.Controllers
{

  [Route("api/[controller]")]
  public class AccountController : Controller
  {
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;
    Task<ApplicationUser> GetCurrentUserAsync() => _userManager.GetUserAsync(HttpContext.User);

    public AccountController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IConfiguration configuration,
        IEmailSender emailSender)
    {
      _userManager = userManager;
      _signInManager = signInManager;
      _configuration = configuration;
      _emailSender = emailSender;
    }

    [HttpPost("login")]
    public async Task<ApiResponse<LoginResult>> Login([FromBody] LoginDto model)
    {
      var result = await _signInManager.PasswordSignInAsync(model.Login, model.Password, false, false);

      if (result.Succeeded)
      {
        var appUser = _userManager.Users.SingleOrDefault(r => (r.UserName ?? "").ToLower() == (model.Login ?? "").ToLower());
        if (!appUser.IsActive) throw new AuthenticationException("User is deactivated");
        var response = new ApiResponse<LoginResult>(new LoginResult
        {
          Token = generateJwtToken(model.Login, appUser),
          UserName = appUser.UserName,
          IsAdmin = await _userManager.IsInRoleAsync(appUser, UserRole.Admin).ConfigureAwait(false),
          IsAdminAssistant = await _userManager.IsInRoleAsync(appUser, UserRole.AdminAssistant).ConfigureAwait(false),
        });
        return response;
      }


      return new ApiResponse<LoginResult>(OperationError.LoginOrPasswordIsInvalid, "User with such login and password does not exist");
    }

    [HttpPost("logout")]
    public async Task<ApiResponseBase> Logout()
    {
      await _signInManager.SignOutAsync().ConfigureAwait(false);
      return new ApiResponseBase();
    }

    [HttpPost("auth")]
    public async Task<ApiResponse<Boolean>> Auth([FromBody] LoginDto model)
    {
      var result = await GetCurrentUserAsync().ConfigureAwait(false);
      if (result == null) return new ApiResponse<bool>(false);
      if (!result.IsActive) throw new AuthenticationException("User is deactivated");
      return new ApiResponse<bool>(true);
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<ApiResponse<string>> ForgotPassword([FromBody] ForgotPasswordModel model)
    {
      if (ModelState.IsValid)
      {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null  /*|| !(await _userManager.IsEmailConfirmedAsync(user))*/)
        {
          // Don't reveal that the user does not exist or is not confirmed.
          return new ApiResponse<string>("Користувач не існує, або його емейн не підтверджено");
        }

        // Send an email with this link
        var code = await _userManager.GeneratePasswordResetTokenAsync(user);
        var callbackUrl = Url.Action(nameof(ResetPassword), "Account",
          new { userId = user.Id, code = code }, protocol: HttpContext.Request.Scheme);
        await _emailSender.SendEmailAsync(model.Email, "Reset Password",
          $"Please reset your password by clicking here: <a href='{callbackUrl}'>link</a>");
        return new ApiResponse<string>("Код для відновлення паролю відправлено на ваш емейл");
      }

      return new ApiResponse<string>(new ApiError("Невідомо", "Виникла помилка відновлення паролю"));

    }

    [HttpGet(nameof(ConfirmEmail))]
    [AllowAnonymous]
    public async Task<ApiResponseBase> ConfirmEmail(string userId, string code)
    {
      var user = await _userManager.FindByIdAsync(userId).ConfigureAwait(false);
      var result = await _userManager.ConfirmEmailAsync(user, code).ConfigureAwait(false);
      return new ApiResponse<bool>(result.Succeeded);
    }

    [HttpGet(nameof(ResetPassword))]
    [AllowAnonymous]
    public async Task<ApiResponse<string>> ResetPassword(string userId, string code)
    {
      var user = await _userManager.FindByIdAsync(userId).ConfigureAwait(false);
      var password = Guid.NewGuid().ToString("N").Substring(0, 8);
      var result = await _userManager.ResetPasswordAsync(user, code, password).ConfigureAwait(false);
      if (!result.Succeeded) return new ApiResponse<string>(new ApiError("code", "Виникла помилка відновленню паролю"));
      return new ApiResponse<string>(password);
    }

    [HttpPost(nameof(ChangePassword))]
    [Authorize]
    public async Task<ApiResponse<string>> ChangePassword([FromBody] ChangePasswordModel model)
    {
      var user = await GetCurrentUserAsync();
      var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword).ConfigureAwait(false);
      if (!result.Succeeded) return new ApiResponse<string>(new ApiError("code", "Виникла помилка відновленню паролю"));
      return new ApiResponse<string>(model.NewPassword);
    }

    private string generateJwtToken(string email, ApplicationUser user)
    {
      var claims = new List<Claim>
          {
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
          };

      // Get User roles and add them to claims
      var roles = _userManager.GetRolesAsync(user).Result;
      addRolesToClaims(claims, roles);


      var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtKey"]));
      var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
      var expires = DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["JwtExpireDays"]));

      var token = new JwtSecurityToken(
        _configuration["JwtIssuer"],
        _configuration["JwtIssuer"],
        claims,
        expires: expires,
        signingCredentials: creds
      );

      return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private void addRolesToClaims(List<Claim> claims, IEnumerable<string> roles)
    {
      foreach (var role in roles)
      {
        var roleClaim = new Claim(ClaimTypes.Role, role);
        claims.Add(roleClaim);
      }
    }

  }



}

