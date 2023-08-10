using System;
using DataAccess.Repository;
using Microsoft.AspNetCore.Mvc;
using SharedDataContracts.Api.Response;
using BusinessLogic.Models.Api;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using BusinessLogic.Helpers;
using BusinessLogic.Models.User;
using BusinessLogic.Repository;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using Storage.Code.Services;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;
using DataAccess.Migrations;
using System.Numerics;

namespace Storage.Controllers
{
  [Route("api/[controller]")]
  // todo allow newRole warehouse manna
  [Authorize(Roles = $"{UserRole.Admin}, {UserRole.User}, {UserRole.AdminAssistant}, {UserRole.WarehouseManager}")]
  public class OrderController : Controller
  {
    private readonly IOrdersRepository _repo;
    private readonly IWarehouseRepository _houseRepo;
    private readonly UserManager<ApplicationUser> _userManager;
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
      var data = await _repo.GetAsync(user.Id, isAdmin, DateTime.UtcNow.AddDays(-60), DateTime.UtcNow.AddHours(12)).ConfigureAwait(false);

      return new ApiResponse<ApiOrder>(data);
    }

    // GET api/values
    [HttpGet("archive/{from}/{to}")]
    public async Task<ApiResponse<ApiOrder>> GetArchiveAsync(long from, long to)
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var fromDate = from.ToDateTime();
      var toDate = to.ToDateTime();
      var isAdmin = await _userManager.IsInRoleAsync(user, UserRole.Admin).ConfigureAwait(false);
      var data = await _repo.GetArchiveAsync(user.Id, isAdmin, fromDate, toDate.AddHours(12)).ConfigureAwait(false);
      return new ApiResponse<ApiOrder>(data);
    }

    [HttpGet("canceled")]
    public async Task<ApiResponse<ApiOrder>> GetClosedOrders()
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await _userManager.IsInRoleAsync(user, UserRole.Admin).ConfigureAwait(false);
      var data = await _repo.GetCanceledOrdersAsync(user.Id, isAdmin, DateTime.Now.AddDays(-30), DateTime.Now.AddHours(12)).ConfigureAwait(false);
      return new ApiResponse<ApiOrder>(data);
    }


    [HttpGet("{id}/history")]
    public async Task<ApiResponse<ApiOrderAction>> GetOrderHistory(int id)
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await _userManager.IsInRoleAsync(user, UserRole.Admin).ConfigureAwait(false);
      var data = await _repo.GetOrderHistoryAsync(user.Id, isAdmin, id).ConfigureAwait(false);
      return new ApiResponse<ApiOrderAction>(data);
    }


    // POST api/values
    [HttpPost]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.User}, {UserRole.AdminAssistant}")]
    public async Task<ApiResponseBase> Post([FromBody] ApiOrder product)
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await _userManager.IsInRoleAsync(user, UserRole.Admin).ConfigureAwait(false);
      isAdmin = isAdmin || await _userManager.IsInRoleAsync(user, UserRole.AdminAssistant).ConfigureAwait(false);
      await _repo.UpdateAsync(user.Id, isAdmin, product);
      return new ApiResponseBase();
    }

    [Obsolete]
    [HttpPost("move/{id}")]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.AdminAssistant}")]
    public async Task<ApiResponseBase> MoveOrder(int id, ApiOrder product)
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      var isAdmin = await _userManager.IsInRoleAsync(user, UserRole.Admin).ConfigureAwait(false);
      isAdmin = isAdmin || await _userManager.IsInRoleAsync(user, UserRole.AdminAssistant).ConfigureAwait(false);
      await _repo.UpdateAsync(user.Id, isAdmin, product);
      return new ApiResponseBase();
    }

    [HttpPost("move/processing")]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.AdminAssistant}, {UserRole.WarehouseManager}")]
    public async Task<ApiResponseBase> MoveOrderToProcessing(ApiOrderMoveToProcessingCommand it)
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      await _repo.MoveOrderToAsync(user.Id, it);
      return new ApiResponseBase();
    }

    [HttpPost("move/shipping")]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.AdminAssistant}")]
    public async Task<ApiResponseBase> MoveOrderToShipping(ApiOrderMoveToShippingCommand it)
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      await _repo.MoveOrderToAsync(user.Id, it);
      return new ApiResponseBase();
    }

    [HttpPost("move/delivered")]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.AdminAssistant}")]
    public async Task<ApiResponseBase> MoveOrderToDelivered(ApiOrderMoveToDeliveredCommand it)
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      await _repo.MoveOrderToAsync(user.Id, it);
      return new ApiResponseBase();
    }

    [HttpPost("reject/{id}")]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.AdminAssistant}")]
    public async Task<ApiResponse<bool>> CancelOrder(int id, [FromBody] ApiOrderCancel model)
    {
      var user = await GetCurrentUserAsync().ConfigureAwait(false);
      if (string.IsNullOrEmpty(model.Reason)) return new ApiResponse<bool>(OperationError.ApiModelValidation, "Не можна скасувати замовлення без вказування причини.");
      if (model.Reason.Length < 6) return new ApiResponse<bool>(OperationError.ApiModelValidation, "Причина повинна містити принаймні 6 символів");
      await _houseRepo.CancelOrderAsync(user.Id, id, model.Reason);
      return new ApiResponse<bool>(true);
    }



    [HttpPost("{id}/sms")]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.AdminAssistant}")]
    public async Task<ApiResponse<SmsResponse>> SentOrderSms(int id, [FromServices] ISmsService smsService, [FromServices] IConfiguration config)
    {
      var sms = config.GetSection("Sms");
      var messageTemplate = sms.GetValue<string>("TtnMessage");
      var order = await _repo.GetAsync(id);

      return new ApiResponse<SmsResponse>(await sendOrderSmsAsync(smsService, order, messageTemplate));
    }

    [HttpPost("sms")]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.AdminAssistant}")]
    public async Task<ApiResponse<SmsResponse>> SentArrayOrdersSms([FromServices] ISmsService smsService, [FromServices] IConfiguration config, ApiSmsSendCommand command)
    {
      List<SmsResponse> results = new List<SmsResponse>();

      var sms = config.GetSection("Sms");
      var messageTemplate = sms.GetValue<string>("TtnMessage");

      foreach ( var id in command.Ids)
      {
        var order = await _repo.GetAsync(id);
        var result = await sendOrderSmsAsync(smsService, order, messageTemplate);
        results.Add(result);
      }

      return new ApiResponse<SmsResponse>(results);
    }
    private async Task<SmsResponse> sendOrderSmsAsync(ISmsService smsService,ApiOrder order, string messageTemplate)
    {
      try
      {
        var ttn = order.OrderNumber;
        var phone = order.ClientPhone;
        var message = string.Format(messageTemplate, ttn);
        var result = await smsService.SendSmsAsync(phone, message);
        return result;
      }
      catch 
      {
        return new SmsResponse() { success=0, data=new ResponseData() {
          messageID=$"Не вдалося відправити sms на замовлення {order.Id}"
        } };
      }
    }
  }
}
