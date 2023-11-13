using System;
using DataAccess.Repository;
using Microsoft.AspNetCore.Mvc;
using SharedDataContracts.Api.Response;
using BusinessLogic.Models.Api;
using BusinessLogic.Repository;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using Storage.Code.Helpers;
using Storage.Code.Services;
using AutoMapper;
using System.Linq;
using Microsoft.Extensions.Configuration;
using BusinessLogic.Models.User;

namespace Storage.Controllers
{
  [Route("api/[controller]")]
  [Authorize]
  public class ProductController : Controller
  {
    private readonly IProductsRepository _repo;
    private readonly IWarehouseRepository _houseRepo;
    private readonly UserManager<ApplicationUser> _userManager;
    Task<ApplicationUser> GetCurrentUserAsync() => _userManager.GetUserAsync(HttpContext.User);


    public ProductController(IProductsRepository repo, IWarehouseRepository houseRepo, UserManager<ApplicationUser> userManager)
    {
      _repo = repo;
      _houseRepo = houseRepo;
      _userManager = userManager;
    }

    // GET api/values
    [HttpGet]
    public async Task<ApiResponse<ApiProduct>> GetAsync()
    {
      var data = await _repo.GetAsync().ConfigureAwait(false);
      return new ApiResponse<ApiProduct>(data);
    }

    [HttpPost("export/generate")]
    [AllowAnonymous]
    public async Task<ApiResponse<string>> GenerateExportAsync([FromServices] IConfiguration configuration, [FromServices] IMapper mapper)
    {
      try
      {
        var data = await _repo.GetAsync().ConfigureAwait(false);
        var exportItems = data.Select(mapper.Map<ApiProduct, CsvProduct>).ToList();
        var exportService = new ExportService(configuration, "products.csv");
        await exportService.ExportAsync(exportItems).ConfigureAwait(false);
        return new ApiResponse<string>("Success");
      }
      catch (Exception e)
      {
        return new ApiResponse<string>(e.Message + e.InnerException?.Message + e.GetType());
      }

    }



    // POST api/values
    [HttpPost]
    [Authorize(Roles = $"{UserRole.Admin}")]
    public ApiResponseBase Post([FromBody] ApiProduct product)
    {
      if (!ModelState.IsValid) return ModelState.ToApiBaseResponse();
      _repo.Update(product);
      return new ApiResponseBase();
    }

    // PUT api/values/5
    [HttpPut]
    [Authorize(Roles = $"{UserRole.Admin}")]
    public ApiResponse<int> Put([FromBody] ApiProduct product)
    {
      if (!ModelState.IsValid) return ModelState.ToApiResponse<int>();

      var id = _repo.Add(product);
      return new ApiResponse<int>(id);
    }

    // DELETE api/values/5
    [HttpDelete("{id}")]
    [Authorize(Roles = $"{UserRole.Admin}")]
    public ApiResponseBase Delete(int id)
    {
      _repo.Delete(id);
      return new ApiResponseBase();
    }

    [HttpPost("{id}/transfer")]
    [Authorize(Roles = $"{UserRole.Admin}")]
    public async Task<ApiResponseBase> Transfer(int id, [FromBody] ApiProdTransfer prodTransfer)
    {
      if (!ModelState.IsValid) return ModelState.ToApiBaseResponse();

      var user = await GetCurrentUserAsync();
      _houseRepo.TransferProduct(user?.Id, id, prodTransfer);
      return new ApiResponseBase();
    }

    [HttpPost("{id}/add")]
    [Authorize(Roles = $"{UserRole.Admin}")]
    public async Task<ApiResponseBase> Add(int id, [FromBody] ApiProdAction model)
    {
      if (!ModelState.IsValid) return ModelState.ToApiBaseResponse();

      var user = await GetCurrentUserAsync();
      _houseRepo.AddProduct(user?.Id, id, model);
      return new ApiResponseBase();
    }

    [HttpPost("sell")]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.User}, {UserRole.AdminAssistant}")]
    public async Task<ApiResponseBase> Sell([FromBody] ApiSellOrder model)
    {
      if (!ModelState.IsValid) return ModelState.ToApiBaseResponse();

      var user = await GetCurrentUserAsync();
      await _houseRepo.SellOrderAsync(user?.Id, model).ConfigureAwait(false);
      return new ApiResponseBase();
    }

    [HttpPut("sell/{orderId:int}")]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.User}, {UserRole.AdminAssistant}")]
    public async Task<ApiResponseBase> EditSaleAsync(int orderId, [FromBody] ApiEditSellOrder command)
    {
      if (!ModelState.IsValid) return ModelState.ToApiBaseResponse();

      var user = await GetCurrentUserAsync();
      command.Id = orderId;
      await _houseRepo.EditSellOrderAsync(user?.Id, command).ConfigureAwait(false);
      return new ApiResponseBase();
    }

    [HttpPost("{id}/remove")]
    [Authorize(Roles = $"{UserRole.Admin}")]
    public async Task<ApiResponseBase> Remove(int id, [FromBody] ApiProdAction model)
    {
      if (!ModelState.IsValid) return ModelState.ToApiBaseResponse();
      var user = await GetCurrentUserAsync();
      _houseRepo.RemoveProduct(user?.Id, id, model);
      return new ApiResponseBase();
    }
  }
}
