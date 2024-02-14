import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientBasketComponent } from './client-basket.component';

describe('BasketComponent', () => {
  let component: ClientBasketComponent;
  let fixture: ComponentFixture<ClientBasketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientBasketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientBasketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
