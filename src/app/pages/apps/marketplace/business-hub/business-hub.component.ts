import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { finalize, Subscription, interval, tap } from 'rxjs';

// --- project services & models
import { TokenService } from 'src/app/services/token/token.service';
import { BusinessAdminPageDto, BusinessHubApi } from 'src/app/services/business-hub.api';
import { BusinessDetailComponent } from '../business-detail/business-detail.component';
import { BusinessHubService } from 'src/app/services/business-hub.service';
import { Category } from 'src/app/services/apps/interfaces/business.interface';

// Dashboard (business-view) bits
import { DashboardService } from 'src/app/services/apps/dashboard/dashboard.service';
import { UserProgress, CompanyDetails } from 'src/app/models/dashboard';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadingService } from 'src/app/services/loading/loading.service';

type AdminRow = {
  businessId: number;
  businessName: string;
  email?: string | null;
  phone?: string | null;
  ownerName?: string | null;
  city?: string | null;
  state?: string | null;
  verified: boolean;
};

type InProgressInfo = { description: string; timeline: string };

enum HubMode {
  ADMIN_HUB = 'ADMIN_HUB',
  CONSUMER_VIEW = 'CONSUMER_VIEW',
  CONSUMER_HUB = 'CONSUMER_HUB',
}

@Component({
  selector: 'app-business-hub',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    DragDropModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './business-hub.component.html',
  styleUrls: ['./business-hub.component.scss'],
})
export class BusinessHubComponent implements OnInit, OnDestroy {
  // ====== DI ======
  private api = inject(BusinessHubApi);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tokenService = inject(TokenService);
  private hub = inject(BusinessHubService);
  private dashboard = inject(DashboardService);
  private loadingService = inject(LoadingService);

  // ====== Refs ======
  @ViewChild('uploader') uploader?: ElementRef<HTMLInputElement>;

  // ====== Subscriptions ======
  private subs: Subscription[] = [];
  private pollingSub?: Subscription;

  // ====== Mode / Role ======
  HubMode = HubMode;
  mode = signal<HubMode>(HubMode.CONSUMER_VIEW);

  isAdmin(): boolean {
    return this.tokenService.getRole?.() === 'Admin';
  }

  // ====== ADMIN (Hub) STATE ======
  rows = signal<AdminRow[]>([]);
  total = signal(0);
  verifiedCount = signal(0);

  page = signal(0);
  size = signal(10);

  search = signal<string>('');
  zip = signal<string | null>(null);
  serviceId = signal<number | null>(null);
  isLoading = signal(false);

  displayedColumns: string[] = [
    'businessName',
    'email',
    'phone',
    'ownerName',
    'city',
    'state',
    'verified',
    'actions',
  ];

  totals = computed(() => {
    const t = this.total();
    const v = this.verifiedCount();
    const p = Math.max(0, t - v);
    return { total: t, verified: v, pending: p };
  });

  filteredRows = computed(() => {
    const q = (this.search() || '').trim().toLowerCase();
    if (!q) return this.rows();
    return this.rows().filter((r) =>
      (r.businessName || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.ownerName || '').toLowerCase().includes(q)
    );
  });

  private currentUploadBusinessId: number | null = null;

  fetchAdmin(): void {
    if (!this.isAdmin()) return;
    this.isLoading.set(true);

    const sub = this.api
      .adminList({
        page: this.page(),
        size: this.size(),
        serviceId: this.serviceId() ?? undefined,
        zipCode: this.zip() ?? undefined,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (resp: BusinessAdminPageDto) => {
          const items = resp?.content ?? [];

          const mapped: AdminRow[] = items.map((it: any) => {
            const b = it.business ?? {};
            const o = it.owner ?? {};

            const derivedVerified =
              it.verified === true ||
              b.verified === true ||
              it.statusName === 'verified' ||
              (typeof b.updatedBy === 'string' && b.updatedBy.toLowerCase() === 'admin');

            return {
              businessId: Number(b['businessId'] ?? 0),
              businessName: String(b['businessName'] ?? '—'),
              email: b['businessEmail'] ?? null,
              phone: o['contactNumber'] ?? null,
              ownerName: [o['firstName'], o['lastName']].filter(Boolean).join(' ') || null,
              city: b['city'] ?? null,
              state: b['state'] ?? null,
              verified: !!derivedVerified,
            };
          });

          this.rows.set(mapped);
          const total = (resp.totalCount ?? resp.totalElements ?? mapped.length) || 0;
          const verified = (resp.verifiedCount ?? mapped.filter((r) => r.verified).length) || 0;
          this.total.set(total);
          this.verifiedCount.set(verified);
        },
        error: (err) => {
          console.error('adminList failed', err);
          this.rows.set([]);
          this.total.set(0);
          this.verifiedCount.set(0);
        },
      });

    this.subs.push(sub);
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.size.set(e.pageSize);
    this.fetchAdmin();
  }

  onSearchInput(e: Event): void {
    this.search.set((e.target as HTMLInputElement | null)?.value ?? '');
  }
  onZipInput(e: Event): void {
    const v = (e.target as HTMLInputElement | null)?.value?.trim() || '';
    this.zip.set(v.length ? v : null);
  }
  onServiceIdInput(e: Event): void {
    const raw = (e.target as HTMLInputElement | null)?.value ?? '';
    const n = Number(raw);
    this.serviceId.set(Number.isFinite(n) ? n : null);
  }
  clearFilters(): void {
    this.search.set('');
    this.zip.set(null);
    this.serviceId.set(null);
    this.page.set(0);
    this.fetchAdmin();
  }

  onView(row: AdminRow) {
    this.router.navigate(['/apps/marketplace/business', row.businessId]);
  }

  private openDetailsDialog(businessId: number) {
    this.isLoading.set(true);
    const sub = this.api
      .getBusiness(businessId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (details) => {
          const ref = this.dialog.open(BusinessDetailComponent, {
            width: '1024px',
            data: { details, readonly: false, allowVerifyToggle: this.isAdmin() },
            autoFocus: false,
            restoreFocus: false,
          });
          ref.afterClosed().subscribe((changed) => {
            if (changed) this.fetchAdmin();
          });
        },
        error: (e) => console.error('Load details failed', e),
      });
    this.subs.push(sub);
  }

  openUploaderFor(businessId: number): void {
    this.currentUploadBusinessId = businessId;
    this.uploader?.nativeElement.click();
  }
  handleImagesSelected(event: Event): void {
    if (!this.currentUploadBusinessId) return;
    const input = event.target as HTMLInputElement | null;
    const files = input?.files;
    if (!files || files.length === 0) return;

    const arr = Array.from(files);
    this.isLoading.set(true);
    const sub = this.api
      .uploadImages(this.currentUploadBusinessId, arr as File[])
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => { if (input) input.value = ''; },
        error: (err) => {
          console.error('uploadImages failed', err);
          if (input) input.value = '';
        },
      });
    this.subs.push(sub);
  }

  // ====== CONSUMER (Marketplace landing) ======
  categories = signal<Category[]>([]);
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('all');
  zipCode = signal<string>('');

  filteredCategories = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.categories();
    return this.categories().filter(c =>
      c.name.toLowerCase().includes(q) || c.value.toLowerCase().includes(q)
    );
  });

  onBack(): void { this.router.navigate(['apps/business-view']); }
  onJoinNow(): void { this.router.navigate(['apps/register']); }
  onCategoryClick(value: string): void { this.router.navigate(['apps/category', value]); }

  onSearchFieldInput(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }
  onCategorySelect(e: Event): void {
    this.selectedCategory.set((e.target as HTMLSelectElement).value || 'all');
  }
  onZipCodeInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value || '';
    this.zipCode.set(v.replace(/\D+/g, '').slice(0, 5));
  }
  onSearch(): void {
    const cat = this.selectedCategory();
    if (cat && cat !== 'all') {
      this.router.navigate(['/apps/category', cat], {
        queryParams: { q: this.searchQuery().trim() || null, zip: this.zipCode() || null },
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate(['/apps/business-hub'], {
        queryParams: { q: this.searchQuery().trim() || null, zip: this.zipCode() || null },
        queryParamsHandling: 'merge'
      });
    }
  }

  // ====== CONSUMER (Business View) ======
  draftList: UserProgress[] = [];
  progressList: UserProgress[] = [];
  completedProgressList: UserProgress[] = [];
  selectedTabIndex = 0;
  selectedCompany: UserProgress | null = null;
  private hoveredCompany: UserProgress | null = null;
  private userId = 0;

  private readonly POLLING_INTERVAL = 30000;
  private readonly STORAGE_KEYS = {
    DRAFT_LIST: 'draftList',
    PROGRESS_LIST: 'progressList',
    COMPLETED_LIST: 'completedProgressList',
    SELECTED_COMPANY: 'selectedCompany',
  };

  getWelcomeMessage(): string {
    const username = this.getUsername();
    const totalCompanies =
      this.draftList.length + this.progressList.length + this.completedProgressList.length;
    const pending = this.draftList.length + this.progressList.length;

    if (totalCompanies === 0) return `Welcome, ${username}!`;
    if (pending > 0) return `Welcome back, ${username}!`;
    return `Great work, ${username}!`;
  }
  getSubtitleMessage(): string {
    const totalCompanies =
      this.draftList.length + this.progressList.length + this.completedProgressList.length;
    const pending = this.draftList.length + this.progressList.length;
    const completed = this.completedProgressList.length;

    if (totalCompanies === 0) return "Let's get your business viewed in marketplace with some initial setup.";
    if (pending > 0 && completed === 0) return `You have ${pending} Marketplace${pending > 1 ? 's' : ''} pending. Let's complete your formations!`;
    if (pending > 0 && completed > 0) return `Managing ${completed} active Marketplace${completed > 1 ? 's' : ''} with ${pending} more pending.`;
    return `Successfully managing ${completed} active Marketplace${completed > 1 ? 's' : ''}. Ready to start another?`;
  }

  getProgressPercentageForCompany(company: UserProgress): number {
    const stepIndex = company.firstIncompleteStepIndex ?? 0;
    const map: Record<number, number> = { 0: 10, 1: 25, 2: 50, 3: 75, 4: 100 };
    return map[stepIndex] || 0;
  }
  getDetailedStatus(stepIndex: number | undefined): string {
    if (stepIndex === undefined) return 'Ready to begin your Marketplace formation journey';
    const map: Record<number, string> = {
      0: 'Getting started with basic information collection',
      1: 'Collecting business details and structure preferences',
      2: 'Setting up registered agent service for your LLC',
      3: 'Processing payment and preparing state filings',
      4: 'LLC formation complete - congratulations!',
    };
    return map[stepIndex] || 'Ready to begin your Marketplace formation journey';
  }
  getNextStepDescription(stepIndex: number | undefined): string {
    if (stepIndex === undefined) return 'Provide basic business information';
    const map: Record<number, string> = {
      0: 'Provide Business Information',
      1: 'Boost your LLC with extra services',
      2: 'Finalize Your Payment',
      3: 'Pick the power that leads your LLC',
      4: '🎉 Formation complete!',
    };
    return map[stepIndex] || 'Continue formation process';
  }
  trackByCompanyId = (i: number, item: any) => item?.companyId ?? item?.businessId ?? i;
  isSuggestedCompany(c: UserProgress) {
    const current = this.selectedCompany || this.getFirstDraftCompany();
    return current?.companyId === c.companyId && !this.selectedCompany;
  }

  private inProgressMap: Record<string, InProgressInfo> = {
    draft: {
      description: 'We’ve saved your details. You can review and continue anytime.',
      timeline: 'Usually minutes to review',
    },
    saved: {
      description: 'We are reviewing your submission for completeness and accuracy.',
      timeline: 'Est. Review Time: 1–2 Business Days',
    },
    reviewed: {
      description: 'Your application has been verified by our team.',
      timeline: 'Ready for filing',
    },
    'ready to file': {
      description: 'All set. We’re preparing your state filing.',
      timeline: 'Same business day (cut-off dependent)',
    },
    filed: {
      description: 'Your filing has been submitted to the state.',
      timeline: '3–10 business days (state dependent)',
    },
    success: {
      description: 'Approved by state. Final documents are prepared.',
      timeline: 'Within 24 hours after approval',
    },
    failure: {
      description: 'An issue occurred. Please review and correct to proceed.',
      timeline: 'Action required',
    },
    pending: {
      description: 'We’re setting things up. You’ll see updates here.',
      timeline: 'A few minutes',
    },
  };
  getInProgressInfo(statusName?: string): InProgressInfo {
    const key = (statusName || 'pending').toLowerCase().trim();
    return (
      this.inProgressMap[key] ?? {
        description: 'Processing your application. We’ll notify you on any updates.',
        timeline: 'Varies by step',
      }
    );
  }

  getSidebarTitle(): string {
    const company = this.getActiveCompany();
    if (company) {
      const name = company.companyName || company.llcName;
      return `${name}`;
    }
    return 'Your LLC Journey';
  }
  getSidebarSubtitle(): string {
    return this.getActiveCompany()
      ? 'Track your formation progress and next steps'
      : 'Professional LLC formation made simple';
  }
  getProgressPercentage(): number {
    const company = this.getActiveCompany();
    if (!company) return 0;
    return this.getProgressPercentageForCompany(company);
  }

  getStatusDisplayText(status?: string): string {
    const map: Record<string, string> = {
      saved: 'Under Review',
      reviewed: 'Verified',
      'ready to file': 'Ready for Filing',
      filed: 'Submitted',
      success: 'Active LLC',
      failure: 'Update Required',
    };
    return map[(status || '').toLowerCase()] || 'Pending';
  }
  getStatusIcon(status?: string): string {
    const map: Record<string, string> = {
      saved: 'edit',
      reviewed: 'visibility',
      'ready to file': 'schedule',
      filed: 'upload',
      success: 'check_circle',
      failure: 'error',
    };
    return map[(status || '').toLowerCase()] || 'hourglass_empty';
  }
  getStatusClass(status?: string): string {
    const map: Record<string, string> = {
      saved: 'status-draft',
      reviewed: 'status-reviewed',
      'ready to file': 'status-ready',
      filed: 'status-filed',
      success: 'status-success',
      failure: 'status-failure',
    };
    return map[(status || '').toLowerCase()] || 'status-pending';
  }

  startWizard(companyId?: number, company?: UserProgress): void {
    this.loadingService.show('Loading company formation progress…');

    if (!companyId) {
      this.loadingService.hide();
      this.router.navigate(['apps/register'], { state: { step: 0 } });
      return;
    }

    if (company) {
      this.selectedCompany = company;
      localStorage.setItem(this.STORAGE_KEYS.SELECTED_COMPANY, JSON.stringify(company));
    }

    const sub = this.dashboard.getUserProgressByCompanyId(companyId).subscribe({
      next: (data) => {
        if (data.managementStyle) sessionStorage.setItem('managementStyle', data.managementStyle);
        sessionStorage.setItem('needEin', String((data as any).step8));
        this.loadingService.hide();

        const step = this.findIncompleteStepIndex(data);
        this.router.navigate(['apps/register'], { state: { step, companyId } });
      },
      error: () => {
        this.loadingService.hide();
        this.router.navigate(['apps/register'], { state: { step: 0, companyId } });
      },
    });
    this.subs.push(sub);
  }
  openViewDetails(_companyId?: number): void { /* reserved for future */ }
  navigateToPages(): void {
    this.loadingService.show('Starting a new business registration…');
    setTimeout(() => {
      this.loadingService.hide();
      this.router.navigate(['apps/register'], { state: { step: 0 } });
    }, 600);
  }
  accessMarketplace(): void { this.mode.set(HubMode.CONSUMER_HUB); }
  accessDocuments(): void { this.router.navigate(['/apps/document']); }
  reviewCompliance(): void { this.router.navigate(['/apps/invoice']); }
  goToUserProfile(): void { this.router.navigate(['/apps/account-settings']); }

  drop(event: CdkDragDrop<UserProgress[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.persistBusinessViewLists();
  }
  onHoverCompany(company: UserProgress): void { this.hoveredCompany = company; }
  onLeaveCompany(): void { this.hoveredCompany = null; }
  selectCompany(company: UserProgress): void {
    this.selectedCompany = company;
    localStorage.setItem(this.STORAGE_KEYS.SELECTED_COMPANY, JSON.stringify(company));
  }

  // ====== lifecycle ======
  ngOnInit(): void {
    // Resolve mode based on role & query
    if (this.isAdmin()) {
      this.mode.set(HubMode.ADMIN_HUB);
      this.fetchAdmin();
    } else {
      const qp = this.route.snapshot.queryParamMap;
      const forceHub =
        qp.get('hub') === '1' ||
        qp.get('hub') === 'true' ||
        (qp.get('mode') || '').toLowerCase() === 'hub';

      this.mode.set(forceHub ? HubMode.CONSUMER_HUB : HubMode.CONSUMER_VIEW);

      const csub = this.hub.getCategories().subscribe(cats => this.categories.set(cats));
      this.subs.push(csub);

      this.userId = Number(localStorage.getItem('login_user_id')) || 0;
      sessionStorage.removeItem('managementStyle');
      sessionStorage.removeItem('needEin');

      this.loadStoredData();
      this.fetchProgress();

      this.pollingSub = interval(this.POLLING_INTERVAL).pipe(tap(() => this.fetchProgress())).subscribe();
      this.subs.push(this.pollingSub);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.pollingSub?.unsubscribe();
  }

  // ====== business-view data helpers ======
  private getUsername(): string {
    const raw = sessionStorage.getItem('userData');
    if (!raw) return 'there';
    try {
      const u = JSON.parse(raw) as { firstName?: string };
      if (u.firstName) {
        const f = u.firstName.trim();
        return f.charAt(0).toUpperCase() + f.slice(1);
      }
      return 'there';
    } catch {
      return 'there';
    }
  }
  private loadStoredData(): void {
    this.draftList = this.getFromStorage(this.STORAGE_KEYS.DRAFT_LIST, []);
    this.progressList = this.getFromStorage(this.STORAGE_KEYS.PROGRESS_LIST, []);
    this.completedProgressList = this.getFromStorage(this.STORAGE_KEYS.COMPLETED_LIST, []);
    this.selectedCompany = this.getFromStorage(this.STORAGE_KEYS.SELECTED_COMPANY, null);
  }
  private getFromStorage<T>(key: string, fallback: T): T {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  }
  private persistBusinessViewLists(): void {
    localStorage.setItem(this.STORAGE_KEYS.DRAFT_LIST, JSON.stringify(this.draftList));
    localStorage.setItem(this.STORAGE_KEYS.PROGRESS_LIST, JSON.stringify(this.progressList));
    localStorage.setItem(this.STORAGE_KEYS.COMPLETED_LIST, JSON.stringify(this.completedProgressList));
  }

  private fetchProgress(): void {
    const sub = this.dashboard
      .getUserProgress(this.userId)
      .pipe(finalize(() => {}))
      .subscribe({
        next: (data) => {
          if (!Array.isArray(data)) {
            this.resetLists();
            return;
          }

          const previouslySelectedId = this.selectedCompany?.companyId;
          const drafts: UserProgress[] = [];
          const inProgress: UserProgress[] = [];
          const completed: UserProgress[] = [];

          data.forEach((item) => {
            const p: UserProgress = {
              companyId: item.companyId,
              state: item.state,
              companyName: item.companyName,
              llcName: item.llcName,
              firstIncompleteStepIndex: item.step,
              steps: [],
              statusName: item.statusName,
            };
            const status = (item.statusName || '').toLowerCase();

            if (status === 'success') completed.push(p);
            else if (item.step !== 4 && item.companyName && item.llcName) drafts.push(p);
            else if (item.step === 4 && status !== 'success') inProgress.push(p);
          });

          this.draftList = drafts;
          this.progressList = inProgress;
          this.completedProgressList = completed;

          // restore selection
          this.updateSelectedCompany(previouslySelectedId);

          this.persistBusinessViewLists();
        },
        error: (e) => {
          console.error('getUserProgress failed', e);
          this.resetLists();
        },
      });
    this.subs.push(sub);
  }
  private resetLists() {
    this.draftList = [];
    this.progressList = [];
    this.completedProgressList = [];
    if (!this.selectedCompany) {
      const first = this.getFirstDraftCompany();
      if (first) {
        this.selectedCompany = first;
        localStorage.setItem(this.STORAGE_KEYS.SELECTED_COMPANY, JSON.stringify(first));
      }
    }
  }
  private updateSelectedCompany(prevId?: number) {
    if (!prevId) return;
    const found =
      this.draftList.find(c => c.companyId === prevId) ||
      this.progressList.find(c => c.companyId === prevId) ||
      this.completedProgressList.find(c => c.companyId === prevId);
    if (found) {
      this.selectedCompany = found;
      localStorage.setItem(this.STORAGE_KEYS.SELECTED_COMPANY, JSON.stringify(found));
    }
  }

  // ⬇️ ⬇️ CHANGED: made this PUBLIC so the template can call it ⬇️ ⬇️
  getFirstDraftCompany(): UserProgress | null {
    return this.draftList.find(c => c.firstIncompleteStepIndex !== undefined) || null;
  }

  private getActiveCompany(): UserProgress | null {
    return this.hoveredCompany || this.selectedCompany || this.getFirstDraftCompany();
  }

  private findIncompleteStepIndex(item: CompanyDetails): number {
    if (!item.step1) return 0;
    if (!item.step2?.companyName) return 1;
    if (!item.step3) return 2;
    if (!item.step4) return 3;
    if (!item.step5 || Object.values(item.step5).some(v => v === null || v === '')) return 4;
    if (!item.step6 || Object.entries(item.step6).some(([k, v]) =>
      !['streetAddress2', 'country', 'email', 'phoneNumber'].includes(k) && (v === null || v === '')
    )) return 5;
    if (item.step7 !== true) return 6;
    if (item.step8 !== true && item.step9 !== true && item.step10 !== true && item.step12 !== true) return 7;
    if (item.step11?.totalCharges == null) return 7;
    if (item.step12 !== true) return 10;
    if ((!item.step13a || item.step13a.length === 0) && (!item.step13b || item.step13b.length === 0)) return 12;
    if (item.managementStyle === 'manager') {
      if (!item.step13a || item.step13a.length === 0) return 13;
      else if (!item.step13b || item.step13b.length === 0) return 14;
    }
    if (item.managementStyle === 'member') {
      if (!item.step13b || item.step13b.length === 0) return 13;
    }
    if (!item.step14 || Object.values(item.step14).some(v => v === null || v === '')) return item.managementStyle === 'manager' ? 14 : 13;
    if (item.step15 !== true) return 15;
    if (item.step15 === true && item.step8 === true) return item.managementStyle === 'manager' ? 17 : 16;
    return 0;
  }
}
