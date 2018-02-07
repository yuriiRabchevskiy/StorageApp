import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppStockComponent } from './app-stock.component';

describe('StockComponent', () => {
  let component: AppStockComponent;
  let fixture: ComponentFixture<AppStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppStockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
