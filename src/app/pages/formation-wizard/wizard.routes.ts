import { Routes } from '@angular/router';

// wizard

import { FormationWizardComponent } from './formation-wizard.component';


export const WizardRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'forms',
        component: FormationWizardComponent,
        data: {
          title: 'Wizard',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Wizard' },
          ],
        },
      },
    ],
  },
];
