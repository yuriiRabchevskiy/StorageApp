using System.Diagnostics.CodeAnalysis;

namespace SharedDataContracts.Api.Response
{
  [ExcludeFromCodeCoverage]
  public class ApiError
  {
    public string Message { get; set; }
    /// <summary>
    /// Gets or sets the code.
    /// </summary>
    public OperationError Code { get; set; }
    public string Field { get; set; }

    public string Details { get; set; }

    public ApiError() { }
    public ApiError(string field, string message) : this()
    {
      Field = field;
      Message = message;
    }


  }
}
