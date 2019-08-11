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
using Storage.Code.Hubs;

namespace Storage.Controllers
{
  [Route("api/[controller]")]
  [Authorize]
  public class ProductController : Controller
  {
    private IProductsRepository _repo;
    private IWarehouseRepository _houseRepo;
    private UserManager<ApplicationUser> _userManager;
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


    // POST api/values
    [HttpPost]
    public ApiResponseBase Post([FromBody] ApiProduct product)
    {
      if (!ModelState.IsValid) return ModelState.ToApiBaseResponse();
      _repo.Update(product);
      return new ApiResponseBase();
    }

    // PUT api/values/5
    [HttpPut]
    public ApiResponse<int> Put([FromBody] ApiProduct product)
    {
      if (!ModelState.IsValid) return ModelState.ToApiResponse<int>();

      var id = _repo.Add(product);
      return new ApiResponse<int>(id);
    }

    // DELETE api/values/5
    [HttpDelete("{id}")]
    public ApiResponseBase Delete(int id)
    {
      _repo.Delete(id);
      return new ApiResponseBase();
    }

    [HttpPost("{id}/transfer")]
    public async Task<ApiResponseBase> Transfer(int id, [FromBody] ApiProdTransfer prodTransfer)
    {
      if (!ModelState.IsValid) return ModelState.ToApiBaseResponse();

      var user = await GetCurrentUserAsync();
      _houseRepo.TransferProduct(user?.Id, id, prodTransfer);
      return new ApiResponseBase();
    }

    [HttpPost("{id}/add")]
    public async Task<ApiResponseBase> Add(int id, [FromBody] ApiProdAction model)
    {
      if (!ModelState.IsValid) return ModelState.ToApiBaseResponse();

      var user = await GetCurrentUserAsync();
      _houseRepo.AddProduct(user?.Id, id, model);
      return new ApiResponseBase();
    }

    [HttpPost("sell")]
    public async Task<ApiResponseBase> Sell([FromBody] ApiSellOrder model, [FromServices]  TrackerHub hub)
    {
      if (!ModelState.IsValid) return ModelState.ToApiBaseResponse();

      var user = await GetCurrentUserAsync();
      await _houseRepo.SellOrderAsync(user?.Id, model).ConfigureAwait(false);
      return new ApiResponseBase();
    }

    [HttpPost("{id}/remove")]
    public async Task<ApiResponseBase> Remove(int id, [FromBody] ApiProdAction model)
    {
      if (!ModelState.IsValid) return ModelState.ToApiBaseResponse();
      var user = await GetCurrentUserAsync();
      _houseRepo.RemoveProduct(user?.Id, id, model);
      return new ApiResponseBase();
    }
  }
}
