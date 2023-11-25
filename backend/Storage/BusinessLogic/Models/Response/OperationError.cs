
namespace SharedDataContracts.Api.Response
{
  public enum OperationError
  {
    #region Common


    // Common
    None = -1,
    Unknown = 0,
    ApiModelValidation,
    SessionTokenExpired,
    AccessRightExcception,
    LoginOrPasswordIsInvalid,

    // actions
    InvalidOperation = 500,

    // App State
    TableIsEmpty = 1000,

    // parameters
    ArgumentCanNotBeNull = 2000,
    WrongInputParameter,
    ItemDoesNotExist,
    ParametersCanNotBeEqual

    #endregion
  }
}
