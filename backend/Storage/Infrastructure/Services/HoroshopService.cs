using BusinessLogic.Helpers.Http;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services;

public interface IHoroshopService
{
  Task SyncProductsPresenceAsync(List<HProductPresence> products);
}

public class HoroshopService : IHoroshopService
{
  private readonly string _apiClient;
  private readonly string _apiSecret;
  private readonly string _apiUrl;
  private readonly bool _syncOn = false;
  public IConfiguration Configuration { get; }

  public HoroshopService(IConfiguration configuration)
  {
    Configuration = configuration;
    var horoshopConfig = Configuration.GetRequiredSection("Horoshop");
    _syncOn = horoshopConfig.GetValue<bool>("SyncOn");
    _apiClient = horoshopConfig.GetValue<string>("ApiClient")!;
    _apiSecret = horoshopConfig.GetValue<string>("ApiSecret")!;
    _apiUrl = horoshopConfig.GetValue<string>("ApiUrl")!;
  }

  public async Task SyncProductsPresenceAsync(List<HProductPresence> products)
  {
    var client = new HoroshopClient(_apiUrl, false);
    var token = await client.LoginAsync(_apiClient, _apiSecret);
    await client.UpdateProductPresenceAsync(token, products);
  }

  public class HoroshopClient : RestApiClient
  {

    private static readonly HttpClient _sharedClient;
    private readonly bool _shared;

    #region Shared

    static HoroshopClient()
    {
      _sharedClient = configureClient(new HttpClient());
    }

    public static void DisposeShared()
    {
      _sharedClient?.Dispose();
    }

    #endregion


    public HoroshopClient(string apiUrl, bool shared = true) : base(
      shared ? _sharedClient : configureClient(new HttpClient()), apiUrl)
    {
      _shared = shared;
    }

    public async Task<string> LoginAsync(string client, string secret)
    {
      var result = await PostApiAsync<AuthRequest, HApiResponse<AuthResponse>>(new AuthRequest()
      {
        Login = client,
        Password = secret
      });
      return result.Response.Token;
    }

    public async Task UpdateProductPresenceAsync(string token, List<HProductPresence> products)
    {
      var result = await PostApiAsync<ProductsImportRequest, HApiResponse<ProductImportResponse>>(new ProductsImportRequest()
      {
        Token = token,
        Products = products
      });
      return;
    }

    #region Private Methods


    private static HttpClient configureClient(HttpClient httpClient)
    {
      return httpClient;
    }

    #endregion

    #region ApiModels

    public class AuthRequest
    {
      public string Login { get; set; }
      public string Password { get; set; }
    }

    public class AuthResponse
    {
      public string Token { get; set; }
    }

    public class HApiResponse<T>
    {
      public string Status { get; set; }
      public T Response { get; set; }
    }

    public class ProductsImportRequest
    {
      public string Token { get; set; }
      public List<HProductPresence> Products { get; set; }
    }

    public class ProductImportResponse
    {
      public List<object> Log { get; set; }
    }

    #endregion

  }

}

public enum HPresense { NotSet = 0, Present = 1, NotPresent = 2, Expected = 3 }

public class HPresenseDto
{
  public HPresense Id { get; set; }
}
public class HProductPresence
{
  public string Article { get; set; }
  public HPresenseDto Presence { get; set; }

}
