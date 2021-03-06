import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenOrdersComponent } from './report.component';

describe('UsersComponent', () => {
  let component: OpenOrdersComponent;
  let fixture: ComponentFixture<OpenOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
