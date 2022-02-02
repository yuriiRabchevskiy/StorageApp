import { Component } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { ApiResponse } from '../../models/api';
import { BaseApiComponent } from '../../models/component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-open-orders',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class OpenOrdersComponent extends BaseApiComponent<string> {
  data: any = 'Немає даних';

  constructor(private apiService: ApiService, private sanitizer: DomSanitizer) {
    super();
  }

  doGetData() {
    return this.apiService.getOpenOrders();
  }

  onDataReceived(res: ApiResponse<string>) {
    if (res.success) {
      this.data = this.sanitizer.bypassSecurityTrustHtml(res.item);
    }

  }


}
