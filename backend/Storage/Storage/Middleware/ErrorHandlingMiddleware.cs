using BusinessLogic.Models.Response;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json;
using SharedDataContracts.Api.Response;
using System.Collections.Generic;
using System.Net;
using System.Security.Authentication;
using System.Threading.Tasks;
using System;
using System.Linq;
using Bv.Meter.WebApp.Common.Exceptions;
using Microsoft.Extensions.Logging;

namespace Storage.Middleware
{
  public class ErrorHandlingMiddleware
  {
    private readonly RequestDelegate _next;
    private readonly ILogger _logger;
    private static readonly Type _invalidOperationExceptionType = typeof(InvalidOperationException);
    private static readonly ExceptionErrorModelResolver _errorResolver;
    private static readonly JsonSerializerSettings _serializerSettings = new()
    {
      ContractResolver = new CamelCasePropertyNamesContractResolver()
    };


    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
      _next = next;
      _logger = logger;
    }

    public async Task Invoke(HttpContext httpContext)
    {
      try
      {
        await _next(httpContext);
      }
      catch (Exception ex)
      {
        //var userId = httpContext.User.GetUserId().ToString();
        //var userDisplayName = httpContext.User.GetUserEmail();
        //var userPermissions = string.Join(", ", httpContext.User.GetAllUserPermissions().Select(x => x.ToString()));
        //var userRequiredPermissions = string.Join(", ", httpContext.User.GetRequiredPermissions().Select(x => x.ToString()));
        //var userType = httpContext.User.GetIsSystemAdmin() ? "Administrator" : httpContext.User.GetIsManager() ? "Manager" : "User";
        _logger.LogError(ex, ex.Message);
        await handleExceptionAsync(httpContext, ex).ConfigureAwait(false);
      }
    }

    private async Task handleExceptionAsync(HttpContext context, Exception exception)
    {
      ApiErrorResponse errorResponse;
      var initialException = exception;

      context.Response.ContentType = "application/json";
      context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

      if (exception is AggregateException agr)
      {
        initialException = agr.InnerExceptions.FirstOrDefault() ?? agr;
      }

      var error = _errorResolver.Resolve(initialException);

      if (error == null)
      {
        errorResponse = new ApiErrorResponse(
            new ApiError
            {
              Code = OperationError.Unknown,
              Message = exception.Message,
              Details = JsonConvert.SerializeObject(initialException, _serializerSettings)
            }
        );
      }
      else
      {
        context.Response.StatusCode = (int)error.HttpCode;

        if (error.Errors == null)
        {
          errorResponse = new ApiErrorResponse(
              new ApiError
              {
                Code = error.Code,
                Message = error.Message,
                Details = error.ErrorId == null ? error.Details : $"Error id: {error.ErrorId}",
                Field = error.Field
              }
          );
        }
        else
        {
          errorResponse = new ApiErrorResponse(error.Errors);
        }

        //if (error.ErrorId == null)
        //    logger.Warn("Known error logged", initialException);
        //else
        //    logger.Warn($"Known error logged, id: {error.ErrorId}", initialException);
      }

      await context.Response.WriteAsync(JsonConvert.SerializeObject(errorResponse, _serializerSettings)).ConfigureAwait(false);
    }

    #region Configuring all error handlers

    static ErrorHandlingMiddleware()
    {

      var handlers = new Dictionary<Type, Func<Exception, ExceptionErrorModel>>
      {
        [typeof(ArgumentNullException)] = exception => new ExceptionErrorModel
        {
          Code = OperationError.ArgumentCanNotBeNull,
          Field = ((ArgumentNullException)exception).ParamName,
          HttpCode = HttpStatusCode.BadRequest
        },
        [typeof(KeyNotFoundException)] = exception => new ExceptionErrorModel
        {
          Field = "Id",
          Code = OperationError.ItemDoesNotExist,
          HttpCode = HttpStatusCode.NotFound
        },
        [typeof(AuthenticationException)] = exception => new ExceptionErrorModel
        {
          Field = "Session Token",
          Code = OperationError.SessionTokenExpired,
          HttpCode = HttpStatusCode.Unauthorized
        },
        [typeof(ApiException)] = context =>
        {
          var real = (ApiException)context;
          return new ExceptionErrorModel
          {
            HttpCode = real.HttpStatusCode,
            Code = real.Code,
            Field = real.Field,
            Message = real.Message,
            Details = real.Details ?? real.InnerException?.Message
          };
        },
        [typeof(ApiErrorsException)] = context =>
        {
          var real = (ApiErrorsException)context;
          return new ExceptionErrorModel
          {
            HttpCode = real.HttpStatusCode > 0 ? real.HttpStatusCode : HttpStatusCode.InternalServerError,
            Errors = real.Errors
          };
        },
        [_invalidOperationExceptionType] = context =>
        {
          var real = (InvalidOperationException)context;
          return new ExceptionErrorModel
          {
            HttpCode = HttpStatusCode.InternalServerError,
            Code = OperationError.InvalidOperation,
            Message = real.Message
          };
        }
      };

      _errorResolver = new ExceptionErrorModelResolver(handlers);
      _errorResolver.Register(_invalidOperationExceptionType, nullableValueExceptionTrigger, nullableValueExceptionHandler, -1);
    }

    private static bool nullableValueExceptionTrigger(Exception exception)
    {
      const string expectedMessage = "Nullable object must have a value.";

      return exception?.Message?.Equals(expectedMessage, StringComparison.InvariantCulture) == true;
    }

    private static ExceptionErrorModel nullableValueExceptionHandler(Exception exception)
    {
      return new ExceptionErrorModel
      {
        HttpCode = HttpStatusCode.InternalServerError,
        Code = OperationError.InvalidOperation,
        Message = exception.Message,
        ErrorId = Guid.NewGuid()
      };
    }

    #endregion
  }

  public class ExceptionErrorModel
  {
    public OperationError Code { get; set; }
    public string Field { get; set; }
    public string Message { get; set; }
    public string Details { get; set; }

    public Guid? ErrorId { get; set; }

    public IReadOnlyCollection<ApiError> Errors { get; set; }
    public HttpStatusCode HttpCode { get; set; } = HttpStatusCode.OK;
  }

  public class ExceptionErrorModelResolver
  {
    private readonly Dictionary<Type, List<(int priority, Func<Exception, bool> trigger, Func<Exception, ExceptionErrorModel> handler)>> registry;

    public ExceptionErrorModelResolver()
    {
      registry = new Dictionary<Type, List<(int priority, Func<Exception, bool> trigger, Func<Exception, ExceptionErrorModel> handler)>>();
    }

    public ExceptionErrorModelResolver(IDictionary<Type, Func<Exception, ExceptionErrorModel>> range) : this()
    {
      RegisterRange(range);
    }

    public ExceptionErrorModel Resolve(Exception exception)
    {
      var handlers = registry.GetValueOrDefault(exception.GetType());

      var errorHandler = (handlers?.Where(h => h.trigger(exception))?.OrderBy(h => h.priority)?.FirstOrDefault())?.handler;

      return errorHandler?.Invoke(exception);
    }

    public void Register(Type exceptionType, Func<Exception, bool> trigger, Func<Exception, ExceptionErrorModel> handler, int? priority = null)
    {
      var handlers = registry.GetValueOrDefault(exceptionType);

      if (handlers == null)
      {
        handlers = new List<(int priority, Func<Exception, bool> trigger, Func<Exception, ExceptionErrorModel> handler)>();

        registry.Add(exceptionType, handlers);
      }

      handlers.Add((priority ?? handlers.Count(), trigger, handler));
    }

    public void Register(Type exceptionType, Func<Exception, ExceptionErrorModel> handler, int? priority = null)
    {
      Register(exceptionType, (e) => true, handler, priority);
    }

    public void RegisterRange(IDictionary<Type, Func<Exception, ExceptionErrorModel>> range)
    {
      foreach (var item in range)
      {
        Register(item.Key, item.Value);
      }
    }
  }
}
