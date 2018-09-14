import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseActionsComponent } from './report.component';

describe('UsersComponent', () => {
  let component: WarehouseActionsComponent;
  let fixture: ComponentFixture<WarehouseActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
