import { UserService } from './../services/user.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse } from '../../models/api';
import { ApiEndpointsConfig } from '../../api.config';

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
        return this._http.get<ApiResponse<T>>(url, this.options);
    }

    protected doPost<T>(urlStr: string, data): Observable<ApiResponse<T>> {
        const url = ApiEndpointsConfig.getFromApi(urlStr);
        return this._http.post<ApiResponse<T>>(url, JSON.stringify(data), this.options);
    }

    protected doPut<T>(urlStr: string, data): Observable<ApiResponse<T>> {
        const url = ApiEndpointsConfig.getFromApi(urlStr);
        return this._http.put<ApiResponse<T>>(url, JSON.stringify(data), this.options);
    }

    protected doDelete<T>(urlStr: string, id: string): Observable<ApiResponse<T>> {
        const url = ApiEndpointsConfig.getFromApi(urlStr + '/' + id);
        return this._http.delete<ApiResponse<T>>(url, this.options);
    }
}
