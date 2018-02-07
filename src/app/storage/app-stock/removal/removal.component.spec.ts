import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdRemovalComponent } from './removal.component';

describe('StockComponent', () => {
  let component: ProdRemovalComponent;
  let fixture: ComponentFixture<ProdRemovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProdRemovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdRemovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
