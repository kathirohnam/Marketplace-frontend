import { Routes } from "@angular/router";

import { DashboardComponent } from "./dashboard/dashBoard.component";
import { InvoiceListComponent } from "./invoice/invoice-list/invoice-list.component";

import { InvoiceViewComponent } from "./invoice/invoice-view/invoice-view.component";
import { EditInvoiceComponent } from "./invoice/invoice-edit/edit-invoice.component";
import { DocumentListComponent } from "./document/document-list/document-list.component";
import { FilerListComponent } from "./filer/filer-list/filer.component";
import { FilerWizardComponent } from "./filer/filer-wizard/filer-wizard.component";
import { AllUsersListComponent } from "./admin/alluser-list/admin-AllUserList.component";
import { AdminAddEditComponent } from "./admin/add-edit/admin-add-edit.component";
import { ConsumerListComponent } from "./vendor/consumer-list/consumer-list.component";
import { ConsumerAddEditComponent } from "./vendor/add-edit/consumer-add-edit.component";
import { FilerDocumentUploadComponent } from "./filer/filer-documentUpload/filer-documentupload-list.component";
import { AppAccountSettingComponent } from "./account-settings/account-setting.component";
import { EinDetailsViewComponent } from "./filer/superfiler-ein-details/ein-details-view/ein-details-view.component";
import { EinDetailsListComponent } from "./filer/superfiler-ein-details/ein-details-list/ein-details-list.component";

import { ForumMainComponent } from "./conversational_forum/forum-main.component";
import { CompanyDetailsComponent } from "./filer/company-details/company-details.component";
import { BusinessHubComponent } from "./marketplace/business-hub/business-hub.component";
import { CategoryDetailComponent } from "./marketplace/category-detail/category-detail.component";
import { BusinessDetailComponent } from "./marketplace/business-detail/business-detail.component";
import { BusinessRegistrationComponent } from "./marketplace/business-registration/business-registration.component";
export const AppsRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "dashboard",
        component: DashboardComponent,
        data: {
          title: "Dashboard",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Dashboard" },
          ],
        },
      },
      {
        path: "invoice",
        component: InvoiceListComponent,
        data: {
          title: "Invoice",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Invoice" },
          ],
        },
      },

      {
        path: "viewInvoice/:id",
        component: InvoiceViewComponent,
        data: {
          title: "View Invoice",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "View Invoice" },
          ],
        },
      },
      {
        path: "editinvoice/:id",
        component: EditInvoiceComponent,
        data: {
          title: "Edit Invoice",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Edit Invoice" },
          ],
        },
      },
      {
        path: "document",
        component: DocumentListComponent,
        data: {
          title: "Document",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Document" },
          ],
        },
      },
      {
        path: "Files",
        component: FilerListComponent,
        data: {
          title: "Files",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Files" },
          ],
        },
      },

      {
        path: "filler",
        component: FilerWizardComponent,
        data: {
          title: "Filer Wizard",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Filer Wizard" },
          ],
        },
      },
      {
        path: "ein-details-view",
        component: EinDetailsViewComponent,
        data: {
          title: "EIN Details View",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "EIN Details View" },
          ],
        },
      },
      {
        path: "ein-details-list",
        component: EinDetailsListComponent,
        data: {
          title: "EIN Details List",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "EIN Details List" },
          ],
        },
      },

      {
        path: "admin",
        component: AllUsersListComponent,
        data: {
          title: "Admin",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Admin" },
          ],
        },
      },
      {
        path: "admin/edit",
        component: AdminAddEditComponent,
        data: {
          title: "Edit Admin",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Edit Admin" },
          ],
        },
      },
      {
        path: "admin/add",
        component: AdminAddEditComponent,
        data: {
          title: "Add Admin",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Add Admin" },
          ],
        },
      },
      // ←— CONSUMER routes replacing the old Admin ones:
      {
        path: "consumer",
        component: ConsumerListComponent,
        data: {
          title: "Consumers",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Consumers" },
          ],
        },
      },
      {
        path: "consumer/add",
        component: ConsumerAddEditComponent,
        data: {
          title: "Add Consumer",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Add Consumer" },
          ],
        },
      },
      {
        path: "consumer/edit",
        component: ConsumerAddEditComponent,
        data: {
          title: "Edit Consumer",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Edit Consumer" },
          ],
        },
      },
      {
        path: "document-upload",
        component: FilerDocumentUploadComponent,
        data: {
          title: "Edit Consumer",
          urls: [
            { title: "Dashboard", url: "/dashboards/dashboard1" },
            { title: "Edit Consumer" },
          ],
        },
      },
      {
        path: "account-settings",
        component: AppAccountSettingComponent,
        data: {
          title: "account-settings",
        },
      },
    ],
  },
  {
    path: "forum",
    component: ForumMainComponent,
    data: {
      title: "LLC Formation forum",
      urls: [
        { title: "Dashboard", url: "/dashboards/dashboard1" },
        { title: "LLC Formation forum" },
      ],
    },
  },

  {
    path: "companyDetails",
    component: CompanyDetailsComponent,
    data: {
      title: "Company-Details",
      urls: [
        { title: "Dashboard", url: "/dashboards/dashboard1" },
        { title: "Company-Details" },
      ],
    },
  },
  {
        path: 'business-hub',
        component: BusinessHubComponent,
        data: {
          title: 'Business Hub',
          urls: [
            { title: 'Marketplace', url: '/marketplace' },
            { title: 'Business Hub' }
          ]
        }
      },
      {
        path: 'category/:value',
        component: CategoryDetailComponent,
        data: {
          title: 'Category Details',
          urls: [
            { title: 'Marketplace', url: '/marketplace' },
            { title: 'Category Details' }
          ]
        }
      },
      {
        path: 'business/:id',
        component: BusinessDetailComponent,
        data: {
          title: 'Business Details',
          urls: [
            { title: 'Marketplace', url: '/marketplace' },
            { title: 'Business Details' }
          ]
        }
      },
      {
        path: 'register',
        component: BusinessRegistrationComponent,
        data: {
          title: 'Business Registration',
          urls: [
            { title: 'Marketplace', url: '/marketplace' },
            { title: 'Business Registration' }
          ]
        }
      }
];
