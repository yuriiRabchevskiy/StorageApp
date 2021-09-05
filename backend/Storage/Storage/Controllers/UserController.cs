using Microsoft.AspNetCore.Mvc;
using SharedDataContracts.Api.Response;
using BusinessLogic.Models.Api;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using AutoMapper;
using BusinessLogic.Models.User;
using Storage.Code.Services;

namespace Storage.Controllers
{
  [Route("api/[controller]")]
  [Authorize(Policy = "RequireAdmin")]
  public class UserController : Controller
  {
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailSender _emailSender;
    private readonly IMapper _mapper;
    Task<ApplicationUser> GetCurrentUserAsync() => _userManager.GetUserAsync(HttpContext.User);

    public UserController(UserManager<ApplicationUser> userManager, IEmailSender emailSender, IMapper mapper)
    {
      _userManager = userManager;
      _emailSender = emailSender;
      _mapper = mapper;
    }

    // GET api/values
    [HttpGet]
    public ApiResponse<ApiUser> Get()
    {
      return new ApiResponse<ApiUser>(_userManager.Users.Where(it => it.IsActive).ToList().Select(it =>
      {
        var user = _mapper.Map<ApiUser>(it);
        user.IsAdmin = _userManager.IsInRoleAsync(it, UserRole.Admin).Result;
        user.IsAdminAssistant = _userManager.IsInRoleAsync(it, UserRole.AdminAssistant).Result;
        return user;
      }).ToList());
    }

    [HttpPost("{id}")]
    public async Task<ApiResponseBase> EditUser(string id, [FromBody] RegisterDto model)
    {
      var user = await _userManager.FindByIdAsync(id);
      user.Surname = model.Surname;
      user.Name = model.Name;
      user.Notes = model.Notes;
      user.UserName = model.Login;
      user.Phone = model.Phone;
      var result = await _userManager.UpdateAsync(user);

      if (!result.Succeeded) return new ApiResponseBase(new ApiError("code", "Виникла помилка редагування користувача"));
      var isAdmin = await _userManager.IsInRoleAsync(user, UserRole.Admin).ConfigureAwait(false);
      var isAdminAssistant = await _userManager.IsInRoleAsync(user, UserRole.AdminAssistant).ConfigureAwait(false);
      if (model.IsAdmin && !isAdmin) await this._userManager.AddToRoleAsync(user, UserRole.Admin).ConfigureAwait(false);
      if (!model.IsAdmin && isAdmin) await this._userManager.RemoveFromRoleAsync(user, UserRole.Admin).ConfigureAwait(false);

      if (model.IsAdminAssistant && !isAdminAssistant) await this._userManager.AddToRoleAsync(user, UserRole.AdminAssistant).ConfigureAwait(false);
      if (!model.IsAdminAssistant && isAdminAssistant) await this._userManager.RemoveFromRoleAsync(user, UserRole.AdminAssistant).ConfigureAwait(false);
      return new ApiResponseBase();
    }

    [HttpPut]
    public async Task<ApiResponseBase> Register([FromBody] RegisterDto model)
    {
      var user = new ApplicationUser
      {
        UserName = model.Login,
        Email = model.Email,
        Name = model.Name,
        Surname = model.Surname,
        Phone = model.Phone,
        IsActive = true
      };
      var result = await _userManager.CreateAsync(user, model.Password);
      if (!result.Succeeded) return new ApiResponseBase(result.Errors.Select(it => new ApiError { Message = it.Description }).ToList());
      await _userManager.AddToRoleAsync(user, model.IsAdmin ? UserRole.Admin : UserRole.User);

      if (model.IsAdminAssistant)
      {
        await _userManager.AddToRoleAsync(user, UserRole.AdminAssistant);
      }

      var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
      var callbackUrl = Url.Action("ConfirmEmail", "Account", new { userId = user.Id, code }, HttpContext.Request.Scheme);
      await _emailSender.SendEmailAsync(model.Email, "Підтвердження аккаунту", $"Будьласка підтвердіть ваш аккаунт перейшовши за посиланням: <a href='{callbackUrl}'>посилання</a>");

      return new ApiResponseBase();
    }


    [HttpDelete("{id}")]
    public async Task<ApiResponseBase> Deactivate(string id)
    {
      var user = await _userManager.FindByIdAsync(id);
      user.IsActive = false;
      var result = await _userManager.UpdateAsync(user);
      if (!result.Succeeded) return new ApiResponseBase(result.Errors.Select(it => new ApiError { Message = it.Description }).ToList());

      return new ApiResponseBase();
    }

  }
}
