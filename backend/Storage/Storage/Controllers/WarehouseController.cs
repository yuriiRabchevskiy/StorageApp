using Microsoft.AspNetCore.Mvc;
using BusinessLogic.Models.Api;
using BusinessLogic.Repository;
using SharedDataContracts.Api.Response;
using Microsoft.AspNetCore.Authorization;

namespace Storage.Controllers
{
  [Route("api/[controller]")]
  [Authorize]
  public class WarehouseController
    {
    private IWarehouseRepository _repo;
    public WarehouseController(IWarehouseRepository repo)
    {
      _repo = repo;
    }

    // GET api/values
    [HttpGet]
    public ApiResponse<ApiWarehouse> Get()
    {
      return new ApiResponse<ApiWarehouse>(_repo.Get());
    }


    // POST api/values
    [HttpPost]
    public ApiResponseBase Post([FromBody] ApiWarehouse product)
    {
      _repo.Update(product);
      return new ApiResponseBase();
    }

    // PUT api/values/5
    [HttpPut]
    public ApiResponseBase Put([FromBody] ApiWarehouse product)
    {
      _repo.Add(product);
      return new ApiResponseBase();
    }

    // DELETE api/values/5
    [HttpDelete("{id}")]
    public ApiResponseBase Delete(int id)
    {
      _repo.Delete(id);
      return new ApiResponseBase();
    }
  }
}
