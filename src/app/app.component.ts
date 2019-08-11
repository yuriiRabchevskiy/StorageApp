import { Component, ViewEncapsulation } from '@angular/core';
import { TrackerService } from './shared/services/tracker.service';

@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  constructor(public trackerService: TrackerService) {

  }
}
