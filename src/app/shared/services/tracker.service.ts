import { ApiOrdersChanges, AppState } from './../../models/api/state/state';
import { HostListener, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { MessageService } from 'primeng/api';
import { ApiEndpointsConfig } from '../../api.config';
import { UserService } from './user.service';
import { ApiProdCountChanges } from '../../models/api/state/state';
import { LiteEvent } from '../helpers/lite-event';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';



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

    public verifyConnected() {
        if (this.isConnected) return;
        console.log('reconnecting...');
        this.connectUser();
    }

    public connectUser() {
        const user = this.userService.getLocal();
        if (!user) return;
        this._userToken = user.token;
        if (this._connection) {
            this._connection.stop();
            this._connection.off('orderChanged');
            this._connection.off('productsCountChanged');
        }
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
            return console.error(err?.toString() ?? 'unknown signalR error');
        });
        console.log(`signal R Hub started for user ${user.userName}`);

    }

}

export class EntityStateHandler {

    public revision: number;

    constructor(private handleMismatch: (state: EntityStateHandler, diff: number) => void) {

    }

    public verifyState(newState: number) {
        const currentState = this.revision;
        if(!currentState) {
            this.revision = newState;
            return;
        }
        const diff = newState - currentState;
        if(diff <= 1) {
            this.revision = newState;
            return; // we should receive the same state or next
        }
        this.handleMismatch(this, diff);
        // todo show state mismatch 
    }
}