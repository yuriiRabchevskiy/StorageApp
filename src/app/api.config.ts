import { Injectable } from '@angular/core';

@Injectable()
export class ApiEndpointsConfig {

    public static isDebug() {
        return location.host.includes('localhost:4200');
    }

    public static getFromApi(url): string {
        return this.getApiEndpoint() + url;
    }

    public static getAppEndpoint() {
        if (ApiEndpointsConfig.isDebug()) {
             return 'http://localhost:4577/';
            // return 'https://sweetkeys.azurewebsites.net/';
        }

        const path = location.pathname;
        const url = location.protocol + '//' + location.host + path;
        return url;
    }

    private static getApiEndpoint(): string {
        return ApiEndpointsConfig.getAppEndpoint() + 'api/';
    }
}
