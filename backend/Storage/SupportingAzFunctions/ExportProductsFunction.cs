using System;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace SupportingAzFunctions
{
  internal class ExportProductsFunction
  {
    private const string HookUrl = "https://sweetkeys.azurewebsites.net/api/product/export/generate";

    [FunctionName("ExportProductsFunction")]
    public static async Task Run([TimerTrigger("0 0 * * * *")] TimerInfo myTimer, ILogger log)
    {
      log.LogInformation($"Triggering status at: {DateTime.Now}");
      var formContent = new object();
      var content = new StringContent(JsonConvert.SerializeObject(formContent), Encoding.UTF8, "application/json");

      var client = new HttpClient();
      var result = await client.PostAsync(HookUrl, content);
      var stringResult = await result.Content.ReadAsStringAsync();
      log.LogInformation($"result: {stringResult}");

      log.LogInformation($"Export triggered successfully at: {DateTime.Now}");
    }
  }
}
