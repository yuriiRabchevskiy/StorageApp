using Microsoft.AspNetCore.Mvc;
using SharedDataContracts.Api.Response;
using BusinessLogic.Models.Api;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using BusinessLogic.Models.User;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using BusinessLogic.Repository.Reports;
using System.Linq;
using Storage.Controllers.Reports;
using Microsoft.Extensions.Configuration;
using BusinessLogic.Helpers;
using System;
using BusinessLogic.Models.Response;

namespace Storage.Controllers
{
  [Route("api/reports/sales-per-user")]
  [Authorize(Roles = UserRole.Admin)]
  public class SalesPerUserController : ReportsControllerBase
  {
    private readonly ISalesPerUserRepository _repo;

    public SalesPerUserController(ISalesPerUserRepository repo,
      UserManager<ApplicationUser> userManager, IConfiguration configuration) : base(userManager, configuration)
    {
      _repo = repo;      
    }

    // GET api/values
    [HttpGet("{from}/{to}")]
    public async Task<ApiResponse<ApiSalePerUser>> Get(long from, long to)
    {
      var dFrom = from.ToDateTime();
      var dTo = to.ToDateTime();
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await GetIsAdminAsync(user);
      var now = DateTime.UtcNow;
      var data = await _repo.GetAsync(user.Id, isAdmin, dFrom, dTo).ConfigureAwait(false);
      return new ApiResponse<ApiSalePerUser>(data.OrderBy(it => it.Category));
    }

  }
}
