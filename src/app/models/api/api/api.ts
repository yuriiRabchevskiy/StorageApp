export const API_COMMUNICATION_ERROR = -1;

export interface IApiErrorInfo {
    code: number;
    message: string;
    field: string;
    details?: string;
}

export interface IApiErrorResponse {
    errors?: IApiErrorInfo[];
    wasConnectionError?: boolean;
    httpStatus?: number;
}

export class ApiResponse<T> {

    revision?: number;
    item: T;
    items: T[];

    constructor(items?: T[]) {
        this.items = items;
    }
}


export interface IForgotPassword {
    email: string;
}
export class ForgotPassword implements IForgotPassword {
    email: string;
    constructor() {}
}
