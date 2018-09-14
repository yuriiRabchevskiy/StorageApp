using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;

namespace SharedDataContracts.Api.Response
{
  [ExcludeFromCodeCoverage]
  public class ApiResponse<TModel> : ApiResponseBase
  {
    /// <summary>
    /// Gets or sets the item. Should be used in case when just one item is returned.
    /// </summary>
    /// <value>
    /// The item.
    /// </value>
    public TModel Item { get; set; }

    /// <summary>
    /// Gets or sets the items. Should be used when many items have to be returned
    /// </summary>
    /// <value>
    /// The items.
    /// </value>
    public IEnumerable<TModel> Items { get; set; }

    /// <summary>
    /// Initializes a new instance of the <see cref="ApiResponse{TModel}"/> class.
    /// </summary>
    public ApiResponse()
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="ApiResponse{TModel}"/> class.
    /// </summary>
    /// <param name="item">The item.</param>
    public ApiResponse(TModel item)
    {
      Item = item;
    }


    /// <summary>
    /// Initializes a new instance of the <see cref="ApiResponse{TModel}"/> class.
    /// </summary>
    /// <param name="items">The items.</param>
    public ApiResponse(IEnumerable<TModel> items)
    {
      Items = items;
    }

    public ApiResponse(OperationError code, string message = null, string field = null) : base(code, message, field) { }

    public ApiResponse(ApiError error) : base(error) { }

    public ApiResponse(List<ApiError> errors) : base(errors) { }
  }
}
