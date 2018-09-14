import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPerProductComponent } from './report.component';

describe('UsersComponent', () => {
  let component: SalesPerProductComponent;
  let fixture: ComponentFixture<SalesPerProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SalesPerProductComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesPerProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
