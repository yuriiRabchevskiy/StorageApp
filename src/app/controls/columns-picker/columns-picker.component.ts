import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ITableColumn } from '@app/models/component/list-api.component';

@Component({
  selector: 'app-columns-picker',
  templateUrl: './columns-picker.component.html',
  styleUrls: ['./columns-picker.component.scss']
})
export class ColumnsPickerComponent implements OnInit {

  private _columns: ITableColumn[];
  public get columns() { return this._columns; }
  @Input() public set columns(value: ITableColumn[]) {
    const safeColumns = value || [];
    this._columns = safeColumns.filter(sc => !sc.shouldHideFunc || !sc.shouldHideFunc());
  }

  private _hiddenColumns: Set<string>;
  public hiddenCopy: Set<string>;

  public get hiddenColumns() { return this._hiddenColumns; }
  @Input() public set hiddenColumns(value: Set<string>) {
    this._hiddenColumns = value;
    this.hiddenCopy = new Set(value);
  }

  @Output() closeDialog: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  onColumnChange(column: ITableColumn, args: InputEvent) {
    const checkbox = args.target as HTMLInputElement;
    const field = column.field;
    if (checkbox.checked) {
      this.hiddenCopy.delete(field);
    } else {
      this.hiddenCopy.add(field);
    }
  }

  close() {
    this.closeDialog.emit(false);
  }

  save() {
    this.hiddenColumns.clear();
    this.hiddenCopy.forEach(el => this._hiddenColumns.add(el));
    this.closeDialog.emit(true);
  }

}
