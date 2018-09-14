using System;
using DataAccess.Repository;
using Microsoft.AspNetCore.Mvc;
using SharedDataContracts.Api.Response;
using BusinessLogic.Models.Api;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using BusinessLogic.Models.User;
using BusinessLogic.Repository;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using BusinessLogic.Repository.Reports;
using System.Linq;
using Storage.Controllers.Reports;
using Microsoft.Extensions.Configuration;
using BusinessLogic.Helpers;
using Storage.Code.Hubs;

namespace Storage.Controllers
{
  [Route("api/reports/sales-per-user")]
  [Authorize]
  public class SalesPerUserController : ReportsControllerBase
  {
    private ISalesPerUserRepository _repo;


    public SalesPerUserController(ISalesPerUserRepository repo,
      UserManager<ApplicationUser> userManager, IConfiguration configuration) : base(userManager, configuration)
    {
      _repo = repo;      
    }

    // GET api/values
    [HttpGet("{from}/{to}")]
    public async Task<ApiResponse<ApiSalePerUser>> Get(long from, long to)
    {
      var dFrom = ClientTyme.GetLocal(from.ToDateTime());
      var dTo = ClientTyme.GetLocal(to.ToDateTime());
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await GetIsAdminAsync(user);
      var now = ClientTyme.Now;
      var data = await _repo.GetAsync(user.Id, isAdmin, dFrom, dTo).ConfigureAwait(false);
      return new ApiResponse<ApiSalePerUser>(data.OrderBy(it => it.Category));
    }

  }
}
