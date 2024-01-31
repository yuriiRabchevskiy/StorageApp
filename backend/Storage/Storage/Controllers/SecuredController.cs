using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Storage.Controllers
{
 

  [ApiController]
  public class SecuredController : Controller
  {
    protected UserManager<ApplicationUser> UserManager { get; init; }

    public SecuredController(UserManager<ApplicationUser> userManager)
    {
      UserManager = userManager;
    }

    protected Task<ApplicationUser> GetCurrentUserAsync() => UserManager.GetUserAsync(HttpContext.User);


  }
}
