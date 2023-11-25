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
using BusinessLogic.Models.Response;

namespace Storage.Controllers
{
  [Route("api/reports/orders-overview")]
  [Authorize(Roles = UserRole.Admin)]
  public class OrdersOverviewController : ReportsControllerBase
  {
    private readonly IOrdersOverviewRepository _repo;

    public OrdersOverviewController(IOrdersOverviewRepository repo,
      UserManager<ApplicationUser> userManager, IConfiguration configuration) : base(userManager, configuration)
    {
      _repo = repo;
    }

    // GET api/values
    [HttpGet("{from}/{to}")]
    public async Task<ApiResponse<ApiOrdersOverview>> Get(long from, long to)
    {
      var dFrom = from.ToDateTime();
      var dTo = to.ToDateTime();
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await GetIsAdminAsync(user);
      var data = await _repo.GetAsync(user.Id, isAdmin, dFrom, dTo).ConfigureAwait(false);
      return new ApiResponse<ApiOrdersOverview>(data.OrderBy(it => it.Category));
    }

  }
}
