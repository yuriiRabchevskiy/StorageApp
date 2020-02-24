import { UserService } from './../../shared/services/user.service';
import { ViewState } from './../../shared/helpers/view';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {MessageService} from 'primeng/api';
import { Location } from '@angular/common';
import { RouteStateComponent } from '../../models/component/state.component';

enum ReportType { salesPerUser, ordersPerUser, openOrders, salesPerProduct, warehouseActions, openOrdersLight }

interface IReportInfo {
  key: ReportType;
  url: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss']
})
export class ReportsSelectionPageComponent extends RouteStateComponent<IReportInfo> {

  view: ViewState = new ViewState();
  rangeValue: Date[] = [];
  refresh: boolean = false;
  baseUrl: string = 'reports';
  uk: any;
  reports: IReportInfo[] = [
    {
      key: ReportType.ordersPerUser,
      title: 'Замовлення за період',
      description: 'Замовлення які були відкриті в обраний період і їх статус.',
      url: 'orders-overview'
    }
  ];

  ReportType = ReportType;
  calendarClass: string = 'st-calendar-calendar';

  constructor(private notifi: MessageService, private userService: UserService,
    location: Location, router: Router, activatedRoute: ActivatedRoute) {

    super(router, location, activatedRoute);
    this.getStartRange();
    const user = userService.getLocal();

    if (!user.isAdmin) return;

    this.setupReports();
    this.selectedItem = this.reports[0];

    this.uk = {
      firstDayOfWeek: 1,
      dayNames: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'],
      dayNamesShort: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      dayNamesMin: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      monthNames: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
      monthNamesShort: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип',
        'Сер', 'Вер', 'Жов', 'Лис', 'Гру'],
      today: 'Сьогодні',
      clear: 'Скинути'
    };
  }

  private setupReports() {
    this.reports.push(
      {
        key: ReportType.salesPerUser,
        title: 'Закриті замовлення',
        description: 'Замовлення які були відкриті в обраний період, які уже закриті. Не важливо коли саме вони були закриті.',
        url: 'closed-orders'
      });
    this.reports.push(
      {
        key: ReportType.warehouseActions,
        title: 'Поповнення Складу',
        description: 'Останні дії на складі. Продажі не показуються.',
        url: 'last-actions'
      });
    this.reports.push(
      {
        key: ReportType.salesPerProduct,
        title: 'Продажі по кожному продукту',
        description: 'Продажі за останні 30 днів згруповані по продуктах.',
        url: 'sales-per-product'
      });
    this.reports.push(
      {
        key: ReportType.openOrders,
        title: 'Список останніх замовлень',
        description: 'Список відкритих замовлень в легкій і читабельній формі.',
        url: 'open-orders'
      });
    this.reports.push(
      {
        key: ReportType.openOrdersLight,
        title: 'Список останніх замовлень (накладні)',
        description: 'Список відкритих замовлень в легкій і читабельній формі.',
        url: 'open-orders-light'
      });
  }

  getStartRange() {
    const today = new Date();
    this.rangeValue.push(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30, 13, 0));
    this.rangeValue.push(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0));
  }

  openPopup() {
    if (this.view.isMobile) {
      this.calendarClass = 'st-calendar-calendar open-fixed';
    } else {
      this.calendarClass = 'st-calendar-calendar';
    }
  }

  closePopup() {
    this.calendarClass = 'st-calendar-calendar';
    this.refresh = true;
  }

  endRefresh(val) {
    this.refresh = val;
  }

  restore(key: string) {
    if (!key) return;
    const desired = this.reports.find(it => this.simplifyForUrl(this.itemToUrlFunc(it)) === key);
    if (desired) {
      this.selectedItem = desired;
    }
  }
  itemToUrlFunc: (it: IReportInfo) => string = (it: IReportInfo) => it.url;

}
