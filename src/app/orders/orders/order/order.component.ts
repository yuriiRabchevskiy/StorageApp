import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { OrderEditorComponent } from '@app/controls/order-editor/order-editor.component';
import { MessageService } from 'primeng/api';
import { IOrder } from './../../../models/storage';

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss']
})
export class OrderComponent {
    @ViewChild('orderEditor', { static: true }) orderEditor: OrderEditorComponent;

    private _order: IOrder;
    get order() { return this._order; }
    @Input() set order(val: IOrder) {
        this._order = val;
        const editedId = this.orderEditor.editedOrderId;
        const currentId = this.order.id;
        if (editedId && currentId && currentId !== editedId) {
            this.notify.add(
                {
                    severity: 'error',
                    summary: 'Помилка',
                    detail: 'Товар який вибрано не відповідає товару що редагується. Оновіть сторінку'
                }
            );
        }
    }
    @Input() canEdit: boolean;

    @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() iSave: EventEmitter<IOrder> = new EventEmitter<IOrder>();

    constructor(private notify: MessageService) {
    }

    createOrder() {
        const editedId = this.orderEditor.editedOrderId;
        const currentId = this.order.id;
        if (editedId && currentId && currentId !== editedId) {
            this.notify.add(
                {
                    severity: 'error',
                    summary: 'Помилка',
                    detail: 'Товар який вибрано не відповідає товару що редагується. Оновіть сторінку'
                }
            );
            return false;
        }
        this.order.orderNumber = this.orderEditor.orderEditForm.value.orderNumber;
        this.order.clientName = this.orderEditor.orderEditForm.value.clientName;
        this.order.clientAddress = this.orderEditor.orderEditForm.value.clientAddress;
        this.order.clientPhone = this.orderEditor.orderEditForm.value.clientPhone;
        this.order.status = this.orderEditor.status.value;
        this.order.payment = this.orderEditor.payment.value;
        this.order.delivery = this.orderEditor.delivery.value;
        this.order.other = this.orderEditor.orderEditForm.value.orderOther;
        return true;
    }

    save() {
        const success = this.createOrder();
        if (!success) return;
        this.iSave.emit(this.order);
    }

    closeDialog() {
        this.onCloseDialog.emit(false);
    }

}
