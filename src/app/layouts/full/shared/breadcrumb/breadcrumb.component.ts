import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { AppBreadcrumbService } from './breadcrumb.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-breadcrumb',
    imports: [CommonModule],
    templateUrl: './breadcrumb.component.html',
    styleUrls: []
})
export class AppBreadcrumbComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isVisible$ = this.breadcrumbService.isBreadcrumbVisible$;
  companyName: string | null = null;
  companyState: string | null = null;
  llcName: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private breadcrumbService: AppBreadcrumbService
  ) {}

  ngOnInit(): void {
    // ✅ Subscribe to company data changes
    this.breadcrumbService.companyData$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.companyName = data.companyName;
      this.companyState = data.companyState;
    });

    // ✅ Listen to route changes to show/hide breadcrumbs and reset company data when leaving
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.handleRouteChange();
      });

    // ✅ Extract company ID from URL and fetch company details if needed
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const companyId = params['companyId'] ? +params['companyId'] : null;
      if (companyId) {
        this.getCompanyDetails(companyId);
      }
    });

    this.handleRouteChange(); // Ensure breadcrumbs visibility is correct on load
  }

  private handleRouteChange(): void {
    const isOnWidgetsBanners = this.router.url.includes('/wizard/forms');

    if (isOnWidgetsBanners) {
      this.breadcrumbService.setBreadcrumbVisibility(true);
    } else {
      this.breadcrumbService.setBreadcrumbVisibility(false);
      this.breadcrumbService.clearCompanyData(); // ✅ Clear company name & state when leaving
    }
  }

  private getCompanyDetails(companyId: number): void {
    const progressList = JSON.parse(localStorage.getItem('progressList') || '[]');
    const selectedCompany = progressList.find((company: any) => company.companyId === companyId);

    if (selectedCompany) {
      this.breadcrumbService.updateCompanyData(selectedCompany.companyName+" "+selectedCompany.llcName,selectedCompany.state);
    } else {
      console.warn(`Company not found for ID: ${companyId}`);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.breadcrumbService.reset();
  }
}
