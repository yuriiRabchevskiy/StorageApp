using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using BusinessLogic.Helpers.Http;
using Microsoft.Extensions.Configuration;

namespace Storage.Code.Services
{
  // https://sms-fly.ua/public/api.v2.02.pdf

  public interface ISmsService
  {
    Task<SmsResponse> SendSmsAsync(string phoneNumber, string message);

    Task<List<SmsResponse>> SendArraySmsAsync(Dictionary<string, string> phoneNumbersAndMessages);
  }

  public class SmsService : ISmsService
  {
    private readonly string _apiKey;
    private readonly string _apiUrl;
    private readonly string _apiSender;
    public IConfiguration Configuration { get; }
    public SmsService(IConfiguration configuration)
    {
      Configuration = configuration;
      var smsSettings = Configuration.GetSection("Sms");
      _apiKey = smsSettings.GetValue<string>("ApiKey");
      _apiUrl = smsSettings.GetValue<string>("ApiUrl");
      _apiSender = smsSettings.GetValue<string>("Sender");
    }

    public async Task<SmsResponse> SendSmsAsync(string phoneNumber, string message)
    {
      var smsClient = new SmsClient(_apiUrl);
      var data = await smsClient.PostApiAsync<SmsRequest, SmsResponse>(new SmsRequest()
      {
        auth = new Auth() { key = _apiKey },
        data = new Data()
        {
          recipient = phoneNumber,
          sms = new SmsInfo
          {
            source = _apiSender,
            text = message,
            ttl = 1440,
          }
        }
      });
      return data;
    }

    public async Task<List<SmsResponse>> SendArraySmsAsync(Dictionary<string, string> phoneNumbersAndMessages)
    {

    }


    public class SmsClient : RestApiClient
    {
      private static readonly HttpClient _sharedClient;
      private readonly bool _shared;

      #region Shared
      static SmsClient()
      {
        _sharedClient = configureClient(new HttpClient());
      }

      public static void DisposeShared()
      {
        _sharedClient?.Dispose();
      }
      #endregion

      public SmsClient(string apiUrl, bool shared = true) : base(shared ? _sharedClient : configureClient(new HttpClient()), apiUrl)
      {
        _shared = shared;
      }

      #region Private Methods


      private static HttpClient configureClient(HttpClient httpClient)
      {
        return httpClient;
      }
      #endregion
    }
  }

  #region SmsApiModels
  public class SmsRequest
  {
    public Auth auth { get; set; }

    public string action { get; } = "SENDMESSAGE";

    public Data data { get; set; }

  }

  public class Auth
  {
    public string key { get; set; }
  }

  public class Data
  {
    public string recipient { get; set; }
    public List<string> channels { get; } = new List<string>(new[] { "sms" });

    public SmsInfo sms { get; set; }
  }

  public class SmsInfo
  {
    public string source { get; set; }
    public int ttl { get; set; } = 1440;
    public string text { get; set; }
  }

  public class SmsResponse
  {
    public short success { get; set; }
    public string date { get; set; }

    public ResponseData data { get; set; }
  }


  public class ResponseData
  {
    public string messageID { get; set; }
    public SmsResponseData sms { get; set; }
  }

  public class SmsResponseData
  {
    public string status { get; set; }
    public string date { get; set; }
  }
  #endregion
}
