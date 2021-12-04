using BusinessLogic.Models.Api;
using CsvHelper;
using Microsoft.AspNetCore.Hosting;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace Storage.Code.Services
{
  public class ExportService
  {
    private readonly IWebHostEnvironment _env;
    private readonly string _fileName;
    public ExportService(IWebHostEnvironment env, string fileName)
    {
      _env = env;
      _fileName = fileName;
    }
    public async Task ExportAsync<T>(List<T> items)
    {
      var wwwRoot = Path.Combine(_env.WebRootPath, "export", _fileName);
      using (var writer = new StreamWriter(wwwRoot, false, Encoding.UTF8))
      using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
      {
        await csv.WriteRecordsAsync(items).ConfigureAwait(false);
      }
    }
  }
}
