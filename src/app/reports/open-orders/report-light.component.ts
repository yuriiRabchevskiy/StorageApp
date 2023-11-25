import { MessageService } from 'primeng/api';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '@app/shared/services/user.service';
import { ApiResponse } from '../../models/api';
import { BaseApiComponent } from '../../models/component';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-open-orders-light',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class OpenOrdersLightComponent extends BaseApiComponent<string> {
  data: any = 'Немає даних';

  constructor(userService: UserService, notify: MessageService, private apiService: ApiService, private sanitizer: DomSanitizer,
  ) {
    super(userService, notify);
  }

  doGetData() {
    return this.apiService.getOpenOrdersLight();
  }

  onDataReceived(res: ApiResponse<string>) {
    this.data = this.sanitizer.bypassSecurityTrustHtml(res.item);
  }


}
