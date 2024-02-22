using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace BusinessLogic.Helpers.Http
{
  public interface IRestApiClient
  {
    string ApiBaseUrl { get; }
  }

  public class RestApiClient : IRestApiClient
  {
    protected HttpClient Client { get; private set; }

    public string ApiBaseUrl { get; private set; }

    protected RestApiClient(HttpClient client, string apiBaseUrl)
    {
      Client = client;
      ApiBaseUrl = apiBaseUrl;
    }

    public async Task<TResult> PostApiAsync<TData, TResult>(TData data)
    {
      var url = ApiBaseUrl;
      var response = await Client.PostAsync(url, new JsonContent(data)).ConfigureAwait(false);
      var res = response.ContentAsString();
      if (response.StatusCode == HttpStatusCode.Unauthorized) throw new UnauthorizedAccessException($"Code: {response.StatusCode}: {response.Content}");
      if (response.StatusCode == HttpStatusCode.Forbidden) throw new UnauthorizedAccessException($"Code: {response.StatusCode}: {response.Content}");
      checkForApiError(response);
      return response.ContentAsType<TResult>();
    }

    private void checkForApiError(HttpResponseMessage response)
    {
      if (response.IsSuccessStatusCode) return;
      //var defaultError = new ApiErrorResponse(OperationError.HttpError,
      //    $"API request failed: Code: {response.StatusCode}: {response.Content.ReadAsStringAsync().Result}");
      //var content = defaultError;
      //try
      //{
      //    var errorResponse = response.ContentAsType<ApiErrorResponse>();
      //    if (errorResponse != null)
      //    {
      //        content = errorResponse;
      //    }
      //}
      //catch
      //{
      //    // use default
      //}
      //throw new ApiErrorsException(content?.Errors, HttpStatusCode.InternalServerError);
    }

  }
}
