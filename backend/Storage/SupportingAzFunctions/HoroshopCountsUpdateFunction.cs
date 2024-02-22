using System;
using System.Linq;
using System.Threading.Tasks;
using DataAccess;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace SupportingAzFunctions
{
  public class HoroshopCountsUpdateFunction
  {
    [FunctionName("HoroshopCountsUpdateFunction")]
    public async Task Run([TimerTrigger("*/5 * * * * *")] TimerInfo myTimer, ILogger log, ApplicationDbContext context)
    {
      var state = await context.AppState.FirstAsync();
      var lastSync = state.HoroshopSyncRevision;
      var productsIdWithChanges = await context.ProductCountChanges.Where(it => it.RevisionNumber > lastSync)
        .Select(it => it.ProductId).Distinct().ToListAsync();
      log.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");
    }
  }
}
