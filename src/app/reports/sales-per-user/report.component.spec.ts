import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPerUsersComponent } from './report.component';

describe('UsersComponent', () => {
  let component: SalesPerUsersComponent;
  let fixture: ComponentFixture<SalesPerUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SalesPerUsersComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesPerUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
