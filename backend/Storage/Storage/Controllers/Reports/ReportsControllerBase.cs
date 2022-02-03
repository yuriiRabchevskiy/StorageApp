using BusinessLogic.Models.User;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace Storage.Controllers.Reports
{
  public class ReportsControllerBase : Controller
  {

    private readonly UserManager<ApplicationUser> _userManager;
    protected Task<ApplicationUser> GetCurrentUserAsync() => _userManager.GetUserAsync(HttpContext.User);

    public ReportsControllerBase(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
      _userManager = userManager;
    }

    protected Task<bool> GetIsAdminAsync(ApplicationUser user)
    {
      return _userManager.IsInRoleAsync(user, UserRole.Admin);
    }
  }
}
