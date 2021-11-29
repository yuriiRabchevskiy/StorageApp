import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnsPickerComponent } from './columns-picker.component';

describe('ColumnsPickerComponent', () => {
  let component: ColumnsPickerComponent;
  let fixture: ComponentFixture<ColumnsPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnsPickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnsPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
