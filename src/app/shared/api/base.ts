import { UserService } from './../services/user.service';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { API_COMMUNICATION_ERROR, ApiResponse, IApiErrorInfo, IApiErrorResponse } from '../../models/api';
import { ApiEndpointsConfig } from '../../api.config';

function extractApiError(err: HttpErrorResponse) {
    const error = err && err.error;
    if (error && error.errors) {
        error.httpStatus = err.status;
        return error as IApiErrorResponse; // if there are errors => it is our API error
    }
    return undefined; // some unknown error
}

export class ApiBase {

    protected _requestOptions: any; // there is no live standart

    private _token: string;
    public get token() { return this._token; }
    public set token(value: string) {
        this._token = value;
        const headers = this.options.headers;
        this.options.headers = headers.set('Authorization', `Bearer ${this.token}`);
        // set token to app storage.
    }

    /** Private Methods */

    public constructor(protected _http: HttpClient, protected userService: UserService) {
        const user = this.userService.getLocal();
        if (!user) return;
        this.token = user.token;
    }

    protected options = {
        headers: new HttpHeaders(
            {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Credentials': 'true',
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': `Bearer ${this.token}`
            }),
        withCredentials: true
    };



    protected doGet<T>(urlStr: string): Observable<ApiResponse<T>> {
        const url = ApiEndpointsConfig.getFromApi(urlStr);
        return this._http.get<ApiResponse<T>>(url, this.options)
        .pipe(
            catchError(error => this.mapHttpErrorToApiOne(error))
        );;
    }

    protected doPost<T>(urlStr: string, data): Observable<ApiResponse<T>> {
        const url = ApiEndpointsConfig.getFromApi(urlStr);
        return this._http.post<ApiResponse<T>>(url, JSON.stringify(data), this.options)
        .pipe(
            catchError(error => this.mapHttpErrorToApiOne(error))
        );;
    }

    protected doPut<T>(urlStr: string, data): Observable<ApiResponse<T>> {
        const url = ApiEndpointsConfig.getFromApi(urlStr);
        return this._http.put<ApiResponse<T>>(url, JSON.stringify(data), this.options)
        .pipe(
            catchError(error => this.mapHttpErrorToApiOne(error))
        );;
    }

    protected doDelete<T>(urlStr: string, id: string | number): Observable<ApiResponse<T>> {
        const url = ApiEndpointsConfig.getFromApi(urlStr + '/' + id);
        return this._http.delete<ApiResponse<T>>(url, this.options).pipe(
            catchError(error => this.mapHttpErrorToApiOne(error))
        );
    }

    protected mapHttpErrorToApiOne(error: HttpErrorResponse) {
        const apiError = extractApiError(error);
        if (apiError) return throwError(() => apiError); // truthy the api error here
        console.error('Unknown API service error occurred', error);
        const message = error && (error.message || error.statusText || error.toString()) || 'Communication Error';
        const errorMsg: IApiErrorInfo = {
            message,
            field: undefined,
            code: API_COMMUNICATION_ERROR,
            details: undefined
        };
        const apiErrorWrap: IApiErrorResponse = {
            errors: [errorMsg],
            wasConnectionError: true,
            httpStatus: error.status
        };
        return throwError(apiErrorWrap);
    }
}
