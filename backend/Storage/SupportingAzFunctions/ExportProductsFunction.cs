using System.Text;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace SupportingAzFunctions
{
  internal class ExportProductsFunction
  {
    private const string HookUrl = "https://sweetkeys.azurewebsites.net/api/product/export/generate";

    private readonly ILogger _logger;

    public ExportProductsFunction(ILoggerFactory loggerFactory)
    {
      _logger = loggerFactory.CreateLogger<ExportProductsFunction>();
    }

    [Function("ExportProductsFunction")]
    public async Task Run([TimerTrigger("0 0 * * * *")] TimerInfo myTimer)
    {
      _logger.LogInformation($"Triggering status at: {DateTime.Now}");
      var formContent = new object();
      var content = new StringContent(JsonConvert.SerializeObject(formContent), Encoding.UTF8, "application/json");

      var client = new HttpClient();
      var result = await client.PostAsync(HookUrl, content);
      var stringResult = await result.Content.ReadAsStringAsync();
      _logger.LogInformation($"result: {stringResult}");

      _logger.LogInformation($"Export triggered successfully at: {DateTime.Now}");
    }
  }
}
