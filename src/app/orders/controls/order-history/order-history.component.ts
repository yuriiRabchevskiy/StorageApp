import { IOrder, IOrderAction, OrderOperation } from './../../../models/storage/order';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {

  @Output() onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  OrderOperation = OrderOperation;

  @Input() order: IOrder;

  private _orderHistory: IOrderAction[];
  public get orderHistory() { return this._orderHistory; }
  @Input() public set orderHistory(value: IOrderAction[]) {
    this._orderHistory = value;
    this.diffs = this.calculateDiff(value);
  }


  public diffs: IDiff[] = [];

  constructor() { }

  ngOnInit() {
  }

  closeDialog() {
    this.onCloseDialog.emit(false);
  }

  private calculateDiff(orders: IOrderAction[]) {
    if (!orders || orders.length === 0) {
      this.diffs = [];
      return;
    }
    const initialAction = orders[0]; // ??
    let lastOne = orders[0].orderJson;
    let lastKeys = Object.keys(lastOne);
    const diffs = orders.slice(1, orders.length - 1).map(current => {
      const currentKeys = Object.keys(current.orderJson);
      const entryDiffs: IEntryDiff[] = currentKeys.filter(key =>
        // we are checking serialized values, so let's use not triple check
        // tslint:disable-next-line:triple-equals
        lastOne[key] != current.orderJson[key]
      ).map(key => {
        return { key: key, value: current.orderJson[key] };
      });
      const diff: IDiff = { ...current, diffs: entryDiffs };
      lastKeys = currentKeys;
      lastOne = current.orderJson;
      return diff;
    });

    diffs.unshift(initialAction as IDiff);
    return diffs;
  }

}

interface IEntryDiff {
  key: string;
  value: any;
}

interface IDiff extends IOrderAction {
  diffs: IEntryDiff[];
}
