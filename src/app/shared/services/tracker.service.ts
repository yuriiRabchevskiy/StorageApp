import { ApiOrdersChanges } from './../../models/api/state/state';
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import {MessageService} from 'primeng/api';
import { ApiEndpointsConfig } from '../../api.config';
import { UserService } from './user.service';
import { ApiProdCountChanges } from '../../models/api/state/state';
import { LiteEvent } from '../helpers/lite-event';

@Injectable()
export class TrackerService {

    public productsCountChanged: LiteEvent<ApiProdCountChanges> = new LiteEvent<ApiProdCountChanges>();
    public orderChanged: LiteEvent<ApiOrdersChanges> = new LiteEvent<ApiOrdersChanges>();

    public get isConnected() {
        return this._connection?.state;
    }

    private _userToken: string;
    private _connection: HubConnection;

    public constructor(private notify: MessageService, private userService: UserService) {
        this.connectUser();
    }

    public connectUser() {
        const user = this.userService.getLocal();
        if (!user) return;
        this._userToken = user.token;
        if (this._connection) this._connection.stop();
        const apiUrl = ApiEndpointsConfig.getAppEndpoint();
        const hubUrl = `${apiUrl}tracker`;
        const builder = new HubConnectionBuilder();
        const connection = builder
            .withUrl(hubUrl, {
                accessTokenFactory: () => this._userToken
            })
            .build();

        this._connection = connection;

        connection.on('productsCountChanged', (data: ApiProdCountChanges) => {
            this.productsCountChanged.trigger(data);
        });

        connection.on('orderChanged', (data: ApiOrdersChanges) => {
            this.orderChanged.trigger(data);
        });



        connection.start().catch(err => {
            return console.error(err.toString());
        });
        console.log(`signal R Hub started for user ${user.userName}`);

    }

}
