using Microsoft.AspNetCore.Mvc;
using SharedDataContracts.Api.Response;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using BusinessLogic.Repository.Reports;
using Storage.Controllers.Reports;
using Microsoft.Extensions.Configuration;
using BusinessLogic.Models.Api.Reports;
using BusinessLogic.Helpers;

namespace Storage.Controllers
{
  [Route("api/reports/warehouse-actions")]
  [Authorize]
  public class WarehouseActionsController : ReportsControllerBase
  {
    private IWarehouseActionsRepository _repo;


    public WarehouseActionsController(IWarehouseActionsRepository repo,
      UserManager<ApplicationUser> userManager, IConfiguration configuration) : base(userManager, configuration)
    {
      _repo = repo;
    }

    // GET api/values
    [HttpGet("{from}/{to}")]
    public async Task<ApiResponse<ApiWarehouseAction>> Get(long from, long to)
    {
      var dFrom = ClientTyme.GetLocal(from.ToDateTime());
      var dTo = ClientTyme.GetLocal(to.ToDateTime());
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await GetIsAdminAsync(user);
      var data = await _repo.GetAsync(user.Id, isAdmin, dFrom, dTo).ConfigureAwait(false);
      return new ApiResponse<ApiWarehouseAction>(data);
    }

  }
}
