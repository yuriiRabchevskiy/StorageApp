import { Injectable } from '@angular/core';

@Injectable()
export class ApiEndpointsConfig {

    public static isDebug() {
        return location.host.includes('localhost:4200');
    }

    public static getFromApi(url): string {
        return this.getApiEndpoint() + url;
    }

    private static getApiEndpoint(): string {
        if (ApiEndpointsConfig.isDebug()) {
            return 'http://localhost:4577/api/';
            // return 'http://btv.cloudapp.net:4200/api/';
        }
        return 'http://btv.cloudapp.net:4200/api/';
    }
}
