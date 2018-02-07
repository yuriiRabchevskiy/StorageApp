export interface IApiErrorInfo {
    code: number;
    message: string;
    field: string;
}

export interface IApiResponseBase {
    success: boolean;
    errors: IApiErrorInfo[];
}

export class ApiResponse<T> {

    success: boolean;
    item: T;
    items: T[];
    errors: IApiErrorInfo[];

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
