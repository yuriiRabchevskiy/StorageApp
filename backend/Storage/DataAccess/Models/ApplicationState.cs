
namespace DataAccess.Models
{
  public class ApplicationState
  {
    public int Id { get; set; }
    public int ProductsRevision { get; set; }
    public int OrdersRevision { get; set; }

    public int HoroshopSyncRevision { get; set; }
  }
}
