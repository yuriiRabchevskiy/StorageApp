using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;

namespace SharedDataContracts.Api.Response
{
    [ExcludeFromCodeCoverage]
    public class ApiResponseBase
    {

        public ApiResponseBase()
        {

        }


        public ApiResponseBase(OperationError code, string message = null, string field = null)
            : this(new ApiError { Code = code, Message = message, Field = field })
        {

        }

        public ApiResponseBase(ApiError error)
        {
            Errors = new List<ApiError>(1) { error };
        }
        public ApiResponseBase(List<ApiError> errors)
        {
            Errors = errors;
        }

        /// <summary>
        /// Gets or sets the errors.
        /// </summary>
        /// <value>
        /// The errors.
        /// </value>
        public List<ApiError> Errors { get; set; }

        /// <summary>
        /// Gets a value indicating whether this <see cref="ApiResponseBase"/> is success.
        /// </summary>
        /// <value>
        ///   <c>true</c> if success; otherwise, <c>false</c>.
        /// </value>
        public bool Success => Errors == null || !Errors.Any();
    }

}
