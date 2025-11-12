import { Component, Output, EventEmitter, Input } from "@angular/core";
import { CoreService } from "src/app/services/core.service";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { RouterModule } from "@angular/router";
import { NgIcon } from "@ng-icons/core";
import { MaterialModule } from "src/app/material.module";
import { BrandingComponent } from "../../vertical/sidebar/branding.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgScrollbarModule } from "ngx-scrollbar";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { navItems } from "../sidebar/sidebar-data";
import { Router } from "@angular/router";
import { InvoiceService } from "src/app/services/apps/invoice/invoice.service";
import { DocumentService } from "src/app/services/apps/document/document.service";
import { AdminService } from "src/app/services/apps/admin/admin.service";
import { TokenService } from "src/app/services/token/token.service";
import { ServiceLogin } from "src/app/services/login/service-login";
import { SnackBarService } from "src/app/shared/snackbar.service";
interface notifications {
  id: number;
  img: string;
  title: string;
  subtitle: string;
}

interface profiledd {
  id: number;
  img: string;
  title: string;
  color: string;
  subtitle: string;
  link: string;
}

interface apps {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface quicklinks {
  id: number;
  title: string;
  link: string;
}

@Component({
    selector: "app-horizontal-header",
    imports: [
        RouterModule,
        CommonModule,
        NgScrollbarModule,
        NgIcon,
        MaterialModule,
        FormsModule,
        MatMenuModule,
        MatButtonModule,
        BrandingComponent,
    ],
    templateUrl: "./header.component.html"
})
export class AppHorizontalHeaderComponent {
  searchText: string = "";

  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  navItemsData = navItems.filter((navitem) => navitem.displayName);

  showFiller = false;

  public selectedLanguage: any = {
    language: "English",
    code: "en",
    type: "US",
    icon: "/assets/images/flag/icon-flag-en.svg",
  };

  public languages: any[] = [
    {
      language: "English",
      code: "en",
      type: "US",
      icon: "/assets/images/flag/icon-flag-en.svg",
    },
    {
      language: "Español",
      code: "es",
      icon: "/assets/images/flag/icon-flag-es.svg",
    },
    {
      language: "Français",
      code: "fr",
      icon: "/assets/images/flag/icon-flag-fr.svg",
    },
    {
      language: "German",
      code: "de",
      icon: "/assets/images/flag/icon-flag-de.svg",
    },
  ];

  constructor(
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private router: Router,
    private invoiceService: InvoiceService,
    private companyService: DocumentService,
    private adminService: AdminService,
    private tokenService: TokenService,
    private loginService: ServiceLogin,
    private SnackBarService: SnackBarService
  ) {
    translate.setDefaultLang("en");
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

  openDialog() {
    const dialogRef = this.dialog.open(AppSearchDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
  ClearLocalStorage() {
    this.loginService.logout().subscribe({
      next: (response) => {
        console.log("Logout response:", response);
        sessionStorage.clear();
        this.tokenService.clearToken(); // Clear tokens
        localStorage.clear();
        this.adminService.clearCache();
        this.companyService.clearCachedData();
        this.router.navigate(["/authentication/login"]); // update path if different
        this.SnackBarService.showSuccess("Logged out successfully");
      },
      error: (error) => {
        // ⚠️ Handle logout failure
        this.SnackBarService.showError("Logout failed. Please try again.");
        console.error("Logout error:", error);
      },
    });
  }

  notifications: notifications[] = [
    {
      id: 1,
      img: "/assets/images/profile/user-1.jpg",
      title: "Roman Joined the Team!",
      subtitle: "Congratulate him",
    },
    {
      id: 2,
      img: "/assets/images/profile/user-2.jpg",
      title: "New message received",
      subtitle: "Salma sent you new message",
    },
    {
      id: 3,
      img: "/assets/images/profile/user-3.jpg",
      title: "New Payment received",
      subtitle: "Check your earnings",
    },
    {
      id: 4,
      img: "/assets/images/profile/user-4.jpg",
      title: "Jolly completed tasks",
      subtitle: "Assign her new tasks",
    },
    {
      id: 5,
      img: "/assets/images/profile/user-5.jpg",
      title: "Roman Joined the Team!",
      subtitle: "Congratulate him",
    },
  ];

  profiledd: profiledd[] = [
    {
      id: 1,
      img: "wallet",
      color: "primarycolor",
      title: "My Profile",
      subtitle: "Account Settings",
      link: "/",
    },
    {
      id: 2,
      img: "shield",
      color: "primarycolor",
      title: "My Inbox",
      subtitle: "Messages & Email",
      link: "/",
    },
    {
      id: 3,
      img: "credit-card",
      color: "primarycolor",
      title: "My Tasks",
      subtitle: "To-do and Daily Tasks",
      link: "/",
    },
  ];
  apps: apps[] = [
    {
      id: 1,
      img: "/assets/images/svgs/icon-dd-chat.svg",
      title: "Chat Application",
      subtitle: "Messages & Emails",
      link: "/",
    },
    {
      id: 2,
      img: "/assets/images/svgs/icon-dd-cart.svg",
      title: "Todo App",
      subtitle: "Completed task",
      link: "/",
    },
    {
      id: 3,
      img: "/assets/images/svgs/icon-dd-invoice.svg",
      title: "Invoice App",
      subtitle: "Get latest invoice",
      link: "/",
    },
    {
      id: 4,
      img: "/assets/images/svgs/icon-dd-date.svg",
      title: "Calendar App",
      subtitle: "Get Dates",
      link: "/",
    },
    {
      id: 5,
      img: "/assets/images/svgs/icon-dd-mobile.svg",
      title: "Contact Application",
      subtitle: "2 Unsaved Contacts",
      link: "/",
    },
    {
      id: 6,
      img: "/assets/images/svgs/icon-dd-lifebuoy.svg",
      title: "Tickets App",
      subtitle: "Create new ticket",
      link: "/",
    },
    {
      id: 7,
      img: "/assets/images/svgs/icon-dd-message-box.svg",
      title: "Email App",
      subtitle: "Get new emails",
      link: "/",
    },
    {
      id: 8,
      img: "/assets/images/svgs/icon-dd-application.svg",
      title: "Courses",
      subtitle: "Create new course",
      link: "/",
    },
  ];

  quicklinks: quicklinks[] = [
    {
      id: 1,
      title: "Pricing Page",
      link: "/",
    },
    {
      id: 2,
      title: "Authentication Design",
      link: "/",
    },
    {
      id: 3,
      title: "Register Now",
      link: "/",
    },
    {
      id: 4,
      title: "404 Error Page",
      link: "/",
    },
    {
      id: 5,
      title: "Notes App",
      link: "/",
    },
    {
      id: 6,
      title: "Employee App",
      link: "/",
    },
    {
      id: 7,
      title: "Todo Application",
      link: "/",
    },
    {
      id: 8,
      title: "Treeview",
      link: "/",
    },
  ];
}

@Component({
    selector: "search-dialog",
    imports: [
        RouterModule,
        MaterialModule,
        NgIcon,
        FormsModule,
        NgScrollbarModule,
    ],
    templateUrl: "search-dialog.component.html"
})
export class AppSearchDialogComponent {
  searchText: string = "";
  navItems = navItems;

  navItemsData = navItems.filter((navitem) => navitem.displayName);

  // filtered = this.navItemsData.find((obj) => {
  //   return obj.displayName == this.searchinput;
  // });
}
