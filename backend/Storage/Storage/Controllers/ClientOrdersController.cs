using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using BusinessLogic.Models.Api.Client;
using BusinessLogic.Models.User;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using BusinessLogic.Models.Response;
using BusinessLogic.Repository;

namespace Storage.Controllers
{
  [Route("api/client/orders")]
  [Authorize(Roles = $"{UserRole.Client}")]
  public class ClientOrdersController : SecuredController
  {
    private readonly IClientOrdersRepository _repo;

    public ClientOrdersController(IClientOrdersRepository repo, UserManager<ApplicationUser> userManager) : base(userManager)
    {
      _repo = repo;
    }

    // GET returns 20 last orders per client 
    [HttpGet]
    public async Task<ApiResponse<ApiClientOrder>> Get()
    {
      var user = await GetCurrentUserAsync();
      var data = await _repo.GetAsync(user.Id).ConfigureAwait(false);

      return new ApiResponse<ApiClientOrder>(data);
    }


  }
}
