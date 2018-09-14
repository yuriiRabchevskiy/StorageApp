import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsSelectionPageComponent } from './reports-page.component';

describe('ReportsSelectionPageComponent', () => {
  let component: ReportsSelectionPageComponent;
  let fixture: ComponentFixture<ReportsSelectionPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReportsSelectionPageComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsSelectionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
