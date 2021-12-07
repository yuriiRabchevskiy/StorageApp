using System;
using CsvHelper;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;

namespace Storage.Code.Services
{
  public class ExportService
  {
    private readonly string _storageConnectionString;
    private readonly string _containerName = "exports";
    private readonly string _fileName;
    public ExportService(IConfiguration configuration, string fileName)
    {
      var azureConfig = configuration.GetSection("Azure");
      _storageConnectionString = azureConfig["BlobStorageConnectionKey"];
      _fileName = fileName;
    }
    public async Task ExportAsync<T>(List<T> items)
    {
      await using var memoryStream = new MemoryStream();
      await using var writer = new StreamWriter(memoryStream, Encoding.UTF8);
      await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
      await csv.WriteRecordsAsync(items).ConfigureAwait(false);

      //Create a unique name for the container

      var blobServiceClient = new BlobServiceClient(_storageConnectionString);
      // Create the container and return a container client object
      var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
      // Get a reference to a blob
      var blobClient = containerClient.GetBlobClient(_fileName);
      var data = new BinaryData(memoryStream.ToArray() );
      var options = new BlobUploadOptions()
        {
          HttpHeaders = new BlobHttpHeaders
          {
            ContentType = "text/csv; charset=UTF-8",
          },
        };
      await blobClient.UploadAsync(data, options);
    }

  }
}
