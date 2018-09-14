import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { ApiEndpointsConfig } from '../../api.config';

@Injectable()
export class TrackerService {

    public constructor() {

        const apiUrl = ApiEndpointsConfig.getAppEndpoint();
        // const connection = new signalR.HubConnection(apiUrl + 'tracker');
        // console.log('started');

        // connection.on('send', data => {
        //     console.log(data);
        // });

        // connection.start()
        //     .then(() => connection.invoke('send', 'Hello'));
    }

}
