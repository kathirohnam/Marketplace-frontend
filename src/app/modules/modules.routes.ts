import { Routes } from '@angular/router';

import { DashboardComponent } from '../pages/apps/dashboard/dashBoard.component';

export const ModulesRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: {
      title: 'Dashboard',
    },
  },
];
