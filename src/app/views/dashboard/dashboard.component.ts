import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { DashboardChartsData, IChartProps } from './dashboard-charts-data';

export interface IUser {
  name: string;
  state: string;
  registered: string;
  country: string;
  usage: number;
  period: string;
  payment: string;
  activity: string;
  avatar: string;
  status: string;
  color: string;
}

export let users: IUser[] = [
  /*{
    name: 'Albert Einstein',
    state: 'New',
    registered: 'Jan 1, 2021',
    country: 'De',
    usage: 50,
    period: 'Jun 11, 2021 - Jul 10, 2021',
    payment: 'Mastercard',
    activity: '10 sec ago',
    avatar: './assets/img/avatars/einstein.jpg',
    status: 'success',
    color: 'success'
  },
  {
    name: 'Nikola Tesla',
    state: 'Recurring ',
    registered: 'Jan 1, 2021',
    country: 'Hr',
    usage: 10,
    period: 'Jun 11, 2021 - Jul 10, 2021',
    payment: 'Visa',
    activity: '5 minutes ago',
    avatar: './assets/img/avatars/tesla.jpg',
    status: 'danger',
    color: 'info'
  },
  {
    name: 'Marie Curie',
    state: 'New',
    registered: 'Jan 1, 2021',
    country: 'Pl',
    usage: 74,
    period: 'Jun 11, 2021 - Jul 10, 2021',
    payment: 'Stripe',
    activity: '1 hour ago',
    avatar: './assets/img/avatars/curie.jpg',
    status: 'warning',
    color: 'warning'
  },
  {
    name: 'Ada Lovelace',
    state: 'Sleep',
    registered: 'Jan 1, 2021',
    country: 'Gb',
    usage: 98,
    period: 'Jun 11, 2021 - Jul 10, 2021',
    payment: 'Paypal',
    activity: 'Last month',
    avatar: './assets/img/avatars/lovelace.jpg',
    status: 'light',
    color: 'danger'
  },*/
];

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(private chartsData: DashboardChartsData) {
  }
  users = users;

  
  public mainChart: IChartProps = {};
  public chart: Array<IChartProps> = [];
  public trafficRadioGroup = new UntypedFormGroup({
    trafficRadio: new UntypedFormControl('Month')
  });

  ngOnInit(): void {
    this.initCharts();
  }

  initCharts(): void {
    this.mainChart = this.chartsData.mainChart;
  }

  setTrafficPeriod(value: string): void {
    this.trafficRadioGroup.setValue({ trafficRadio: value });
    this.chartsData.initMainChart(value);
    this.initCharts();
  }
}
