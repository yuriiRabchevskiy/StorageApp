using DataAccess.Repository;
using Microsoft.AspNetCore.Mvc;
using SharedDataContracts.Api.Response;
using BusinessLogic.Models.Api;
using BusinessLogic.Repository;
using System;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;

namespace Storage.Controllers
{
  [Route("api/[controller]")]
  [Authorize]
  public class CategoryController : Controller
  {
    private ICategoriesRepository _repo;
    private UserManager<ApplicationUser> _userManager;
    Task<ApplicationUser> GetCurrentUserAsync() => _userManager.GetUserAsync(HttpContext.User);


    public CategoryController(ICategoriesRepository repo, UserManager<ApplicationUser> userManager)
    {
      _repo = repo;
      _userManager = userManager;
    }

    // GET api/values
    [HttpGet]
    public ApiResponse<ApiCategory> Get()
    {
      return new ApiResponse<ApiCategory>(_repo.Get());
    }


    // POST api/values
    [HttpPost]
    public ApiResponseBase Post([FromBody] ApiCategory product)
    {
      _repo.Update(product);
      return new ApiResponseBase();
    }

    // PUT api/values/5
    [HttpPut]
    public ApiResponseBase Put([FromBody] ApiCategory product)
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
