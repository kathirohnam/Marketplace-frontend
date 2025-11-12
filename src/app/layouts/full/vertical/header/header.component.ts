import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { navItems } from '../sidebar/sidebar-data';
import { TranslateService } from '@ngx-translate/core';
import { NgIcon } from '@ng-icons/core';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { InvoiceService } from 'src/app/services/apps/invoice/invoice.service';
import { DocumentService } from 'src/app/services/apps/document/document.service';
import { UserModel } from 'src/app/models/account-settings';
import { AdminService } from 'src/app/services/apps/admin/admin.service';
import { TokenService } from 'src/app/services/token/token.service';
import { ServiceLogin } from 'src/app/services/login/service-login';
import { SnackBarService } from 'src/app/shared/snackbar.service';
import { UserService } from 'src/app/shared/userService';

// Interfaces remain the same...
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
  subtitle: string;
  link: string;
  color: string;
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
  selector: 'app-header',
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    NgIcon,
    MaterialModule,
    FormsModule,
    MatMenuModule,
    MatSidenavModule,
    MatButtonModule,
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchText: string = '';
  navItems = navItems;
  defaultAvatarUrl: string = '/assets/avatar-0.jpg';
  isToggleDisabled: boolean = false;

  navItemsData = navItems.filter((navitem) => navitem.displayName);
  role: string = '';
  user: UserModel;

  private userSubscription: Subscription;

  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  showFiller = false;

  public selectedLanguage: any = {
    language: 'English',
    code: 'en',
    type: 'US',
    icon: '/assets/images/flag/icon-flag-en.svg',
  };

  public languages: any[] = [
    {
      language: 'English',
      code: 'en',
      type: 'US',
      icon: '/assets/images/flag/icon-flag-en.svg',
    },
    {
      language: 'Español',
      code: 'es',
      icon: '/assets/images/flag/icon-flag-es.svg',
    },
    {
      language: 'Français',
      code: 'fr',
      icon: '/assets/images/flag/icon-flag-fr.svg',
    },
    {
      language: 'German',
      code: 'de',
      icon: '/assets/images/flag/icon-flag-de.svg',
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
    private userService: UserService,
    private SnackBarService: SnackBarService
  ) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    const storedRole = this.tokenService.getRole();
    if (storedRole) {
      this.role = storedRole;
    }

    this.userSubscription = this.userService.user$.subscribe((userData) => {
      if (userData) {
        this.user = userData;
      }
      // Reactively check the button state whenever user data changes
      this.checkButtonDisabledState(userData);
    });
  }

  checkButtonDisabledState(currentUser: UserModel | null): void {
    try {
      const companyCountString = sessionStorage.getItem('companyCount');
      const companyCount = companyCountString
        ? Number(companyCountString)
        : 0;

      // The button will be disabled if companyCount is 0 or less,
      // and both firstName and lastName are missing from the current user data.
      if (
        companyCount <= 0 &&
        (!currentUser?.firstName || !currentUser?.lastName)
      ) {
        this.isToggleDisabled = true;
      } else {
        this.isToggleDisabled = false;
      }
    } catch (error) {
      console.error('Error reading session storage for button state:', error);
      this.isToggleDisabled = false; // Default to enabled on error
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  openDialog() {
    // This assumes AppSearchDialogComponent exists and is imported correctly
    // const dialogRef = this.dialog.open(AppSearchDialogComponent);
    // dialogRef.afterClosed().subscribe((result) => {
    //   console.log(`Dialog result: ${result}`);
    // });
  }

  getProfileImageUrl(): string {
    return this.user?.profileImageUrl || this.defaultAvatarUrl;
  }

  onProfileImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultAvatarUrl;
  }

  ClearLocalStorage() {
    this.loginService.logout().subscribe({
      next: (response) => {
        console.log('Logout response:', response);
        sessionStorage.clear();
        this.tokenService.clearToken();
        localStorage.clear();
        this.adminService.clearCache();
        this.companyService.clearCachedData();
        this.router.navigate(['/authentication/login']);
        this.SnackBarService.showSuccess('Logged out successfully');
      },
      error: (error) => {
        this.SnackBarService.showError('Logout failed. Please try again.');
        console.error('Logout error:', error);
      },
    });
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

  // Other properties (notifications, profiledd, etc.) remain unchanged...
  notifications: notifications[] = [
    {
      id: 1,
      img: '/assets/images/profile/user-1.jpg',
      title: 'Roman Joined the Team!',
      subtitle: 'Congratulate him',
    },
    {
      id: 2,
      img: '/assets/images/profile/user-2.jpg',
      title: 'New message received',
      subtitle: 'Salma sent you new message',
    },
    {
      id: 3,
      img: '/assets/images/profile/user-3.jpg',
      title: 'New Payment received',
      subtitle: 'Check your earnings',
    },
    {
      id: 4,
      img: '/assets/images/profile/user-4.jpg',
      title: 'Jolly completed tasks',
      subtitle: 'Assign her new tasks',
    },
    {
      id: 5,
      img: '/assets/images/profile/user-5.jpg',
      title: 'Roman Joined the Team!',
      subtitle: 'Congratulate him',
    },
  ];

  profiledd: profiledd[] = [
    {
      id: 1,
      img: 'account_circle',
      color: 'primarycolor',
      title: 'My Profile',
      subtitle: 'Account Settings',
      link: '/apps/account-settings',
    },
    {
      id: 2,
      img: 'security', // instead of shield
      color: 'primarycolor',
      title: 'My Inbox',
      subtitle: 'Messages & Email',
      link: '',
    },
    {
      id: 3,
      img: 'credit_card', // Material icon name
      color: 'primarycolor',
      title: 'My Tasks',
      subtitle: 'To-do and Daily Tasks',
      link: '',
    },
  ];
  apps: apps[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-dd-chat.svg',
      title: 'Chat Application',
      subtitle: 'Messages & Emails',
      link: '/',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-dd-cart.svg',
      title: 'Todo App',
      subtitle: 'Completed task',
      link: '/',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-dd-invoice.svg',
      title: 'Invoice App',
      subtitle: 'Get latest invoice',
      link: '/',
    },
    {
      id: 4,
      img: '/assets/images/svgs/icon-dd-date.svg',
      title: 'Calendar App',
      subtitle: 'Get Dates',
      link: '/',
    },
    {
      id: 5,
      img: '/assets/images/svgs/icon-dd-mobile.svg',
      title: 'Contact Application',
      subtitle: '2 Unsaved Contacts',
      link: '/',
    },
    {
      id: 6,
      img: '/assets/images/svgs/icon-dd-lifebuoy.svg',
      title: 'Tickets App',
      subtitle: 'Create new ticket',
      link: '/',
    },
    {
      id: 7,
      img: '/assets/images/svgs/icon-dd-message-box.svg',
      title: 'Email App',
      subtitle: 'Get new emails',
      link: '/',
    },
    {
      id: 8,
      img: '/assets/images/svgs/icon-dd-application.svg',
      title: 'Courses',
      subtitle: 'Create new course',
      link: '/',
    },
  ];

  quicklinks: quicklinks[] = [
    {
      id: 1,
      title: 'Pricing Page',
      link: '/',
    },
    {
      id: 2,
      title: 'Authentication Design',
      link: '/',
    },
    {
      id: 3,
      title: 'Register Now',
      link: '/',
    },
    {
      id: 4,
      title: '404 Error Page',
      link: '/',
    },
    {
      id: 5,
      title: 'Notes App',
      link: '/',
    },
    {
      id: 6,
      title: 'Employee App',
      link: '/',
    },
    {
      id: 7,
      title: 'Todo Application',
      link: '/',
    },
    {
      id: 8,
      title: 'Treeview',
      link: '/',
    },
  ];
}

@Component({
  selector: 'search-dialog',
  imports: [
    RouterModule,
    MaterialModule,
    NgIcon,
    FormsModule,
    NgScrollbarModule,
  ],
  templateUrl: 'search-dialog.component.html',
})
export class AppSearchDialogComponent {
  searchText: string = '';
  navItems = navItems;

  navItemsData = navItems.filter((navitem) => navitem.displayName);
}