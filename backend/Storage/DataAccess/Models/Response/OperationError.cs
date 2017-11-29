
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

        // App State
        TableIsEmpty = 1000,

        // parameters
        ArgumentCanNotBeNull = 2000,
        WrongInputParameter,
        ItemDoesNotExist,
        ParametersCanNotBeEqual,


        // SIGMA API ERROR
        SaPassRequired = 3000,
        SchemeNotAppropriate = 3001,
        SigmaServiceError = 3002,
        SyncServiceError = 3003,
        LocationIsOffline = 3004,
        LocationDoesNotExist = 3005,
        #endregion

        #region DATA PROCESSING ERRORS

        NoDataToProcess = 4000,
        TooManyFiles = 4001,
        NoDateColumn,
        NoDateProvided,
        ToManyDateColumns,
        InvalidDateExtra,
        NoLocationColumns,
        LocationUsedMultipleTimes,
        LocationMappingIncorrect,
        InvalidLocationExtra,

        #endregion
    }
}
