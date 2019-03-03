using DataAccess;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace Storage
{
  public class Program
  {
    public static void Main(string[] args)
    {
      BuildWebHost(args).Run();

    }

    // do  not rename
    private static IWebHost BuildWebHost(string[] args) =>
          WebHost.CreateDefaultBuilder(args)
              .UseStartup<Startup>()
              .Build();
  }
}
