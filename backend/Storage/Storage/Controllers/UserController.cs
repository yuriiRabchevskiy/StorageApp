using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using SharedDataContracts.Api.Response;
using BusinessLogic.Models.Api;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using AutoMapper;
using BusinessLogic.Models.Response;
using BusinessLogic.Models.User;
using Bv.Meter.WebApp.Common.Exceptions;
using DataAccess;
using Microsoft.EntityFrameworkCore;
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

    public UserController(UserManager<ApplicationUser> userManager, IEmailSender emailSender, IMapper mapper)
    {
      _userManager = userManager;
      _emailSender = emailSender;
      _mapper = mapper;
    }

    // GET api/values
    [HttpGet]
    public ApiResponse<ApiUser> Get([FromServices] ApplicationDbContext context)
    {
      var dbUsers = context.Users.Include(it => it.Discounts).Where(it => it.IsActive).ToList();
      var users = new ApiResponse<ApiUser>(dbUsers.Select(it =>
      {
        var user = _mapper.Map<ApiUser>(it);
        user.IsAdmin = _userManager.IsInRoleAsync(it, UserRole.Admin).Result;
        user.Role = _userManager.GetRolesAsync(it).Result.FirstOrDefault();
        user.DiscountMultipliers = it.Discounts.Select(x => x.DiscountMultiplier).OrderByDescending(x => x).ToList();
        return user;
      }).ToList());
      return users;
    }

    [HttpPut("{id}")]
    public async Task<ApiResponseBase> EditUser(string id, [FromBody] EditUserCommand model, [FromServices] ApplicationDbContext context)
    {
      var user = await _userManager.FindByIdAsync(id);
      user.Surname = model.Surname;
      user.Name = model.Name;
      user.Notes = model.Notes;
      user.UserName = model.Login;
      user.Phone = model.Phone;
      user.DropAddress = model.DropAddress;
      var result = await _userManager.UpdateAsync(user);

      if (!result.Succeeded) throw new ApiErrorsException(new ApiError("code", "Виникла помилка редагування користувача"));
      var isAdmin = await _userManager.IsInRoleAsync(user, UserRole.Admin).ConfigureAwait(false);
      if (model.IsAdmin && !isAdmin) await this._userManager.AddToRoleAsync(user, UserRole.Admin).ConfigureAwait(false);
      if (!model.IsAdmin && isAdmin) await this._userManager.RemoveFromRoleAsync(user, UserRole.Admin).ConfigureAwait(false);

      var currentRoles = await _userManager.GetRolesAsync(user).ConfigureAwait(false);
      var currentRole = currentRoles.FirstOrDefault();
      if (currentRole != model.Role && UserRole.IsSupportedRole(model.Role))
      {
        if (currentRole != null)
        {
          await _userManager.RemoveFromRoleAsync(user, currentRole);
        }

        await _userManager.AddToRoleAsync(user, model.Role);
      }


      await updateDiscountsInfo(id, model, context);

      return new ApiResponseBase();
    }

    private static async Task updateDiscountsInfo(string id, EditUserCommand edited, ApplicationDbContext context)
    {
      var userDb = await context.Users.Include(it => it.Discounts).FirstAsync(it => it.Id == id);
      var exitingMultipliers = userDb.Discounts.Select(it => it.DiscountMultiplier).ToList();
      var deletedDiscounts = userDb.Discounts.Where(ex => !edited.DiscountMultipliers.Contains(ex.DiscountMultiplier)).ToList();
      var newDiscounts = edited.DiscountMultipliers.Where(mul => !exitingMultipliers.Contains(mul)).ToList();

      context.RemoveRange(deletedDiscounts);
      newDiscounts.ForEach(mul => userDb.Discounts.Add(new UserDiscount { DiscountMultiplier = mul }));

      await context.SaveChangesAsync();
    }


    [HttpPost]
    public async Task<ApiResponseBase> Register([FromBody] RegisterUserCommand model)
    {
      var user = new ApplicationUser
      {
        UserName = model.Login,
        Email = model.Email,
        Name = model.Name,
        Surname = model.Surname,
        Phone = model.Phone,
        IsActive = true,
        DropAddress = model.DropAddress,
        Discounts = model.DiscountMultipliers.Select(mul => new UserDiscount { DiscountMultiplier = mul }).ToList(),
      };
      var result = await _userManager.CreateAsync(user, model.Password);
      if (!result.Succeeded) throw new ApiErrorsException(result.Errors.Select(it => new ApiError { Message = it.Description }).ToList());
      if (UserRole.IsSupportedRole(model.Role))
      {
        await _userManager.AddToRoleAsync(user, model.Role);
      }
      else
      {
        await _userManager.AddToRoleAsync(user, UserRole.User);
      }

      try
      {
        var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        await _userManager.ConfirmEmailAsync(user, code).ConfigureAwait(false);
      }
      catch
      {
        // optional feature
      }

      //var callbackUrl = Url.Action("ConfirmEmail", "Account", new { userId = user.Id, code }, HttpContext.Request.Scheme);
      //await _emailSender.SendEmailAsync(model.Email, "Підтвердження аккаунту", $"Будь ласка підтвердіть ваш аккаунт перейшовши за посиланням: <a href='{callbackUrl}'>посилання</a>");

      return new ApiResponseBase();
    }


    [HttpDelete("{id}")]
    public async Task<ApiResponseBase> Deactivate(string id)
    {
      var user = await _userManager.FindByIdAsync(id);
      user.IsActive = false;
      var result = await _userManager.UpdateAsync(user);
      if (!result.Succeeded) throw new ApiErrorsException(result.Errors.Select(it => new ApiError { Message = it.Description }).ToList());

      return new ApiResponseBase();
    }

  }
}
