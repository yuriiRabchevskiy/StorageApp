using Microsoft.AspNetCore.Mvc.ModelBinding;
using SharedDataContracts.Api.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogic.Models.Response;
using Bv.Meter.WebApp.Common.Exceptions;

namespace Storage.Code.Helpers
{
  public static class ErrorMessagesHelper
  {

    public static ApiErrorsException ToApiErrorsException(this ModelStateDictionary modelState)
    {
      return new ApiErrorsException(modelState.ToApiErrors());
    }

    public static ApiErrorResponse ToApiResponse<T>(this ModelStateDictionary modelState)
    {
      return new ApiErrorResponse(modelState.ToApiErrors());
    }

    public static List<ApiError> ToApiErrors(this ModelStateDictionary modelState)
    {
      return modelState.Keys
       .SelectMany(key => modelState[key].Errors.Select(x => new ApiError(key, x.ErrorMessage)))
       .ToList();
    }
  }
}
