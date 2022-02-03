using Microsoft.AspNetCore.Mvc;
using BusinessLogic.Models.Api;
using BusinessLogic.Models.User;
using BusinessLogic.Repository;
using SharedDataContracts.Api.Response;
using Microsoft.AspNetCore.Authorization;

namespace Storage.Controllers
{
  [Route("api/[controller]")]
  public class WarehouseController
    {
    private IWarehouseRepository _repo;
    public WarehouseController(IWarehouseRepository repo)
    {
      _repo = repo;
    }

    // GET api/values
    [HttpGet]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.User}, {UserRole.AdminAssistant}, {UserRole.Client}")]
    public ApiResponse<ApiWarehouse> Get()
    {
      return new ApiResponse<ApiWarehouse>(_repo.Get());
    }


    // POST api/values
    [HttpPost]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.User}, {UserRole.AdminAssistant}")]
    public ApiResponseBase Post([FromBody] ApiWarehouse product)
    {
      _repo.Update(product);
      return new ApiResponseBase();
    }

    // PUT api/values/5
    [HttpPut]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.User}, {UserRole.AdminAssistant}")]
    public ApiResponseBase Put([FromBody] ApiWarehouse product)
    {
      _repo.Add(product);
      return new ApiResponseBase();
    }

    // DELETE api/values/5
    [HttpDelete("{id}")]
    [Authorize(Roles = $"{UserRole.Admin}, {UserRole.User}, {UserRole.AdminAssistant}")]
    public ApiResponseBase Delete(int id)
    {
      _repo.Delete(id);
      return new ApiResponseBase();
    }
  }
}
