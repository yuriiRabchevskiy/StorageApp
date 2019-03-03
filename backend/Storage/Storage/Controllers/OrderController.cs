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

namespace Storage.Controllers
{
  [Route("api/[controller]")]
  [Authorize]
  public class OrderController : Controller
  {
    private IOrdersRepository _repo;
    private IWarehouseRepository _houseRepo;
    private UserManager<ApplicationUser> _userManager;
    Task<ApplicationUser> GetCurrentUserAsync() => _userManager.GetUserAsync(HttpContext.User);


    public OrderController(IOrdersRepository repo, IWarehouseRepository houseRepo,
      UserManager<ApplicationUser> userManager)
    {
      _repo = repo;
      _userManager = userManager;
      _houseRepo = houseRepo;
    }

    // GET api/values
    [HttpGet]
    public async Task<ApiResponse<ApiOrder>> Get()
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await _userManager.IsInRoleAsync(user, UserRole.Admin).ConfigureAwait(false);
      var data = await _repo.GetAsync(user.Id, isAdmin, DateTime.Now.AddDays(-30), DateTime.Now).ConfigureAwait(false);
      return new ApiResponse<ApiOrder>(data);
    }

    [HttpGet("canceled")]
    public async Task<ApiResponse<ApiOrder>> GetClosedOrders()
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await _userManager.IsInRoleAsync(user, UserRole.Admin).ConfigureAwait(false);
      var data = await _repo.GetCanceledOrdersAsync(user.Id, isAdmin, DateTime.Now.AddDays(-30), DateTime.Now).ConfigureAwait(false);
      return new ApiResponse<ApiOrder>(data);
    }


    // POST api/values
    [HttpPost]
    public async Task<ApiResponseBase> Post([FromBody] ApiOrder product)
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await _userManager.IsInRoleAsync(user, UserRole.Admin).ConfigureAwait(false);
      await _repo.UpdateAsync(user.Id, isAdmin, product);
      return new ApiResponseBase();
    }

    [HttpPost("reject/{id}")]
    [Authorize(Policy = "RequireAdmin")]
    public async Task<ApiResponse<bool>> CancelOrder(int id, [FromBody] ApiOrderCancel model)
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      if (string.IsNullOrEmpty(model.Reason)) return new ApiResponse<bool>(OperationError.ApiModelValidation, "Не можна скасувати замовлення без вказування причини.");
      if (model.Reason.Length < 6) return new ApiResponse<bool>(OperationError.ApiModelValidation, "Причина повинна містити принаймні 6 символів");
      await _houseRepo.CancelOrderAsync(user.Id, id, model.Reason);
      return new ApiResponse<bool>(true);
    }


  }
}
