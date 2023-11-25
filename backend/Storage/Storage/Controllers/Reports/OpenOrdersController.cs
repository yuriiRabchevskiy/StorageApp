using Microsoft.AspNetCore.Mvc;
using SharedDataContracts.Api.Response;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using BusinessLogic.Models.User;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using BusinessLogic.Repository.Reports;
using Storage.Controllers.Reports;
using Microsoft.Extensions.Configuration;
using BusinessLogic.Helpers;
using System;
using BusinessLogic.Models.Response;

namespace Storage.Controllers
{
  [Route("api/reports/open-orders")]
  [Authorize(Roles = UserRole.Admin)]
  public class OpenOrdersController : ReportsControllerBase
  {
    private readonly IOpenOrdersRepository _repo;

    public OpenOrdersController(IOpenOrdersRepository repo,
      UserManager<ApplicationUser> userManager, IConfiguration configuration) : base(userManager, configuration)
    {
      _repo = repo;
    }

    // GET api/values
    [HttpGet]
    public async Task<ApiResponse<string>> Get(long from, long to)
    {
      var dFrom = from.ToDateTime();
      var dTo = to.ToDateTime();

      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await GetIsAdminAsync(user);
      var data = await _repo.GetAsync(user.Id, isAdmin, dFrom, dTo).ConfigureAwait(false);
      return new ApiResponse<string>(data);
    }


    [HttpGet("light")]
    public async Task<ApiResponse<string>> GetOnlyOrderNumbers()
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await GetIsAdminAsync(user);
      var now = DateTime.UtcNow;
      var data = await _repo.GetLightweightAsync(user.Id, isAdmin, now.AddDays(-30), now).ConfigureAwait(false);
      return new ApiResponse<string>(data);
    }
  }
}
