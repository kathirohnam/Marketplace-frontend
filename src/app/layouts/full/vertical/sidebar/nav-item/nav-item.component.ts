import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { NavItem } from './nav-item';
import { Router } from '@angular/router';
import { NavService } from '../../../../../services/nav.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon } from '@ng-icons/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TokenService } from 'src/app/services/token/token.service';
import { UserService } from 'src/app/shared/userService';
import { Subscription } from 'rxjs';
import { UserModel } from 'src/app/models/account-settings';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProfileUpdateDialogComponent } from 'src/app/pages/apps/account-settings/profile-update-dialog/profile-update-dialog.component';

@Component({
  selector: 'app-nav-item',
  // Note: Added MatDialogModule here
  imports: [
    TranslateModule,
    NgIcon,
    MaterialModule,
    CommonModule,
    MatDialogModule,
  ],
  templateUrl: './nav-item.component.html',
  // You no longer need the tooltip, so the old SCSS can be removed or repurposed
  styleUrls: ['./nav-item.component.scss'], 
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class AppNavItemComponent implements OnChanges, OnInit, OnDestroy {
  @Output() toggleMobileLink = new EventEmitter<void>();
  @Output() notify = new EventEmitter<boolean>();

  @Input() item!: NavItem;
  @Input() depth = 0;

  private allowedItems: Record<string, string[]> = {
    Admin: ['Admin', 'Invoice', 'Document'],
    SuperFiler: ['Files', 'Company Details', 'Document Upload', 'EIN Filing'],
    Vendor: ['Consumer'],
    Consumer: ['Dashboard', 'Invoice', 'Document', 'Forum', 'Business Hub'],
  };

  expanded = false;
  isProfileIncomplete = false;
  private userSubscription: Subscription;

  @HostBinding('attr.aria-expanded')
  get ariaExpanded(): boolean {
    return this.expanded;
  }

  constructor(
    private navService: NavService,
    public router: Router,
    private tokenService: TokenService,
    private userService: UserService,
    private dialog: MatDialog // Inject MatDialog service
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.user$.subscribe((user) => {
      this.checkProfileStatus(user);
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  checkProfileStatus(user: UserModel | null): void {
    try {
      const companyCountString = sessionStorage.getItem('companyCount');
      const companyCount = companyCountString
        ? Number(companyCountString)
        : 0;

      this.isProfileIncomplete = companyCount <= 0 && (!user?.firstName || !user?.lastName);
    } catch (error) {
      console.error(
        'Error reading session storage for profile status:',
        error
      );
      this.isProfileIncomplete = false;
    }
  }

  openProfileUpdateDialog(): void {
    this.dialog.open(ProfileUpdateDialogComponent, {
      width: '450px',
    });
  }

  onItemSelected(item: NavItem): void {
    if (this.isProfileIncomplete) {
      this.openProfileUpdateDialog();
      return;
    }

    if (!item.children?.length) {
      this.router.navigate([item.route as string]);
    } else {
      this.expanded = !this.expanded;
    }
    window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    if (!this.expanded && window.innerWidth < 1024) this.notify.emit();
  }

  onSubItemSelected(item: NavItem): void {
    if (this.isProfileIncomplete) {
        this.openProfileUpdateDialog();
        return;
    }

    if (!item.children?.length) {
      this.router.navigate([item.route as string]);
      if (this.expanded && window.innerWidth < 1024) this.notify.emit();
    }
  }

  // No changes to other methods...
  ngOnChanges(): void {
    const url = this.navService.currentUrl();
    if (this.item.route && url) {
      this.expanded = url.startsWith(`/${this.item.route}`);
    }
  }

  isAllowed(): boolean {
    const role = this.tokenService.getRole() || '';
    if (!role) {
      return false;
    }
    if (this.item.navCap) return true;
    return (
      this.allowedItems[role]?.includes(this.item.displayName ?? '') ?? false
    );
  }

  getNavCap(): string {
    return this.item.navCap ?? '';
  }

  openExternal(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}