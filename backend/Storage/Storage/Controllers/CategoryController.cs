using DataAccess.Repository;
using Microsoft.AspNetCore.Mvc;
using SharedDataContracts.Api.Response;
using BusinessLogic.Models.Api;
using BusinessLogic.Models.Response;
using BusinessLogic.Models.User;
using Microsoft.AspNetCore.Identity;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;

namespace Storage.Controllers
{
  [Route("api/[controller]")]
  [Authorize]
  public class CategoryController : Controller
  {
    private readonly ICategoriesRepository _repo;

    public CategoryController(ICategoriesRepository repo)
    {
      _repo = repo;
    }

    // GET api/values
    [HttpGet]
    public ApiResponse<ApiCategory> Get()
    {
      return new ApiResponse<ApiCategory>(_repo.Get());
    }


    // POST api/values
    [HttpPost]
    [Authorize(Roles = $"{UserRole.Admin}")]
    public ApiResponseBase Post([FromBody] ApiCategory product)
    {
      _repo.Update(product);
      return new ApiResponseBase();
    }

    // PUT api/values/5
    [HttpPut]
    [Authorize(Roles = $"{UserRole.Admin}")]
    public ApiResponseBase Put([FromBody] ApiCategory product)
    {
      _repo.Add(product);
      return new ApiResponseBase();
    }

    // DELETE api/values/5
    [HttpDelete("{id}")]
    [Authorize(Roles = $"{UserRole.Admin}")]
    public ApiResponseBase Delete(int id)
    {
      _repo.Delete(id);
      return new ApiResponseBase();
    }

  }
}
