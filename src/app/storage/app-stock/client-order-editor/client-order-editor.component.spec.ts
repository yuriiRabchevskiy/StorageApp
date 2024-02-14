import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientOrderEditorComponent } from './client-order-editor.component';

describe('OrderEditorComponent', () => {
  let component: ClientOrderEditorComponent;
  let fixture: ComponentFixture<ClientOrderEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientOrderEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientOrderEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
