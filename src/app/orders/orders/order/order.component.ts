import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { IOrder } from './../../../models/storage';

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss']
})
export class OrderComponent {
    @ViewChild('orderEditor', {static: true}) orderEditor;

    private _order: IOrder;
    get order() { return this._order; }
    @Input() set order(val: IOrder) { this._order = val; }
    @Input() canEdit: boolean;

    @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() iSave: EventEmitter<IOrder> = new EventEmitter<IOrder>();

    constructor(private apiService: ApiService) {
    }

    createOrder() {
        debugger
        this.order.orderNumber = this.orderEditor.orderEditForm.value.orderNumber;
        this.order.clientName = this.orderEditor.orderEditForm.value.clientName;
        this.order.clientAddress = this.orderEditor.orderEditForm.value.clientAddress;
        this.order.clientPhone = this.orderEditor.orderEditForm.value.clientPhone;
        this.order.status = this.orderEditor.status.value;
        this.order.payment = this.orderEditor.payment.value;
        this.order.other = this.orderEditor.orderEditForm.value.orderOther;
    }

    save() {
        this.createOrder();
        this.iSave.emit(this.order);
    }

    closeDialog() {
        this.onCloseDialog.emit(false);
    }

}
