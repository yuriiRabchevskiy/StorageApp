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
      
    }
}
