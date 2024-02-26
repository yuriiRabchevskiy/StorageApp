using System;
using System.Linq;
using System.Threading.Tasks;
using DataAccess;
using Infrastructure.Services;
using Microsoft.Azure.WebJobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace SupportingAzFunctions
{
  public class HoroshopCountsUpdateFunction
  {
    [FunctionName("HoroshopCountsUpdateFunction")]
    public async Task Run([TimerTrigger("0 */5 * * * *")] TimerInfo myTimer, ILogger log,
      ApplicationDbContext context, IHoroshopService hService)
    {
      log.LogInformation($"Triggering sync at: {DateTime.Now}");
      if (!hService.SyncOn)
      {
        log.LogInformation($"Horoshop sync disabled for this environment");
        return;
      }

      var state = await context.AppState.AsNoTracking().FirstAsync();
      var lastSync = state.HoroshopSyncRevision;
      var productsInfo = await context.ProductCountChanges.Where(it => it.RevisionNumber > lastSync)
        .Select(it => new { it.ProductId, it.RevisionNumber }).ToListAsync();

      var productsIdWithChanges = productsInfo.Select(it => it.ProductId).Distinct().OrderBy(it => it).ToList();
      if (productsIdWithChanges.Count == 0)
      {
        log.LogInformation($"No items to sync");
        return;
      }

      var maxRevision = productsInfo.Max(it => it.RevisionNumber);

      log.LogInformation($"Sync from r{lastSync} to r{maxRevision} | " +
                         $"Found {productsIdWithChanges.Count} products: \n\r {string.Join(',', productsIdWithChanges)}");

      var productStates = await context.WarehouseProducts
                          .Include(it => it.Product)
                          .Where(it => productsIdWithChanges.Contains(it.ProductId))
                          .Select(it => new { it.ProductId, it.Product.ProductCode, it.Product.ZeroAvailabilityMarker, it.Quantity })
                          .GroupBy(it => new { it.ProductId, it.ProductCode, it.ZeroAvailabilityMarker })
                          .Select(it => new HProductPresence()
                          {
                            Article = it.Key.ProductCode,
                            Presence = new HPresenseDto(it.Sum(a => a.Quantity), it.Key.ZeroAvailabilityMarker)
                          })
                          .ToListAsync();
      log.LogInformation($"Found {productsIdWithChanges.Count} items to sync: \n\r {string.Join(',', productsIdWithChanges)}");
      try
      {
        await hService.SyncProductsPresenceAsync(productStates);
        log.LogInformation("Sync completed. Saving sync info...");

        var currentState = await context.AppState.FirstAsync();
        currentState.HoroshopSyncRevision = maxRevision;
        await context.SaveChangesAsync();
        log.LogInformation("Saved, sync OK!");
      }
      catch (Exception e)
      {
        log.LogError(e, "Sync failed!");
        throw;
      }


    }
  }
}
