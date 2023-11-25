using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using SharedDataContracts.Api.Response;

namespace Bv.Meter.WebApp.Common.Exceptions
{
  public class ApiException : Exception
  {
    public ApiException(string message) : base(message)
    {
    }

    public ApiException(string message, Exception innerException) : base(message, innerException)
    {
    }

    public ApiException(OperationError code, string message) : base(message)
    {
      Code = code;
    }

    public HttpStatusCode HttpStatusCode { get; set; } = HttpStatusCode.InternalServerError;

    public OperationError Code { get; set; } = OperationError.ItemDoesNotExist;
    public string Field { get; set; }
    public string Details { get; set; }
  }

  public class ApiErrorsException : Exception
  {
    public HttpStatusCode HttpStatusCode { get; }
    public IReadOnlyCollection<ApiError> Errors { get; }

    public ApiErrorsException(ApiError error, HttpStatusCode httpStatusCode = HttpStatusCode.InternalServerError)
      : base(error.Message)
    {
      Errors = new[] { error };
      HttpStatusCode = httpStatusCode;
    }

    public ApiErrorsException(IReadOnlyCollection<ApiError> errors, HttpStatusCode httpStatusCode = HttpStatusCode.InternalServerError)
            : base(formMessage(errors))
    {
      Errors = errors;
      HttpStatusCode = httpStatusCode;
    }

    private static string formMessage(IReadOnlyCollection<ApiError> errors)
    {
      if (errors == null || errors.Count == 0) return "Unknown Error occurred";
      if (errors.Count == 1)
      {
        return errors.First().Message;
      }

      var sb = new StringBuilder();
      foreach (var apiError in errors)
      {
        sb.AppendLine(apiError.Message);
      }

      return sb.ToString();
    }
  }
}
