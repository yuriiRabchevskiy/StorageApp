import { UserService } from './../services/user.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Http, RequestOptionsArgs, Headers } from '@angular/http';
import { ApiResponse } from '../../models/api';
import { ApiEndpointsConfig } from '../../api.config';

export class ApiBase {

    protected _requestOptions: RequestOptionsArgs;
    protected _requestFormOptions: RequestOptionsArgs;

    private _token: string;
    public set token(value: string) {
        this._token = value;
        this._requestOptions = this.prepareRequestOptions();
        // set token to app storage.
    }
    public get token() {
        return this._token;
    }

    /** Private Methods */
    protected prepareRequestOptions(): RequestOptionsArgs {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Credentials', 'true');
        headers.append('X-Requested-With', 'XMLHttpRequest');
        headers.append('Authorization', `Bearer ${this.token}`);
        return { headers: headers, withCredentials: true };
    }

    public constructor(protected _http: Http, protected userService: UserService) {
        const user = this.userService.getLocal();
        if (!user) return;
        this._token = user.token;
    }

    protected get Options() {
        if (this._requestOptions) return this._requestOptions;
        this._requestOptions = this.prepareRequestOptions();
        return this._requestOptions;
    }


    protected doGet(urlStr: string): Observable<ApiResponse<any>> {
        let url = ApiEndpointsConfig.getFromApi(urlStr);
        return this._http.get(url, this.Options).map(res => res.json());
    }

    protected doPost(urlStr: string, data): Observable<ApiResponse<any>> {
        let url = ApiEndpointsConfig.getFromApi(urlStr);
        return this._http.post(url, JSON.stringify(data), this.Options).map(res => res.json());
    }

    protected doPut(urlStr: string, data): Observable<ApiResponse<any>> {
        let url = ApiEndpointsConfig.getFromApi(urlStr);
        return this._http.put(url, JSON.stringify(data), this.Options).map(res => res.json());
    }

    protected doDelete(urlStr: string, id: string): Observable<ApiResponse<any>> {
        let url = ApiEndpointsConfig.getFromApi(urlStr + '/' + id);
        return this._http.delete(url, this.Options).map(res => res.json());
    }
}
