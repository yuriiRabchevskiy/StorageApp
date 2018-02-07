using Microsoft.AspNetCore.Mvc.ModelBinding;
using SharedDataContracts.Api.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Storage.Code.Helpers
{
  public static class ErrorMessagesHelper
  {

    public static ApiResponseBase ToApiBaseResponse(this ModelStateDictionary modelState)
    {
      return new ApiResponseBase(modelState.ToApiErrors());
    }

    public static ApiResponse<T> ToApiResponse<T>(this ModelStateDictionary modelState)
    {
      return new ApiResponse<T>(modelState.ToApiErrors());
    }

    public static List<ApiError> ToApiErrors(this ModelStateDictionary modelState)
    {
      return modelState.Keys
       .SelectMany(key => modelState[key].Errors.Select(x => new ApiError(key, x.ErrorMessage)))
       .ToList();
    }
  }
}
