// src/app/pages/apps/marketplace/category-detail/category-detail.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';

import { BusinessHubService, BusinessCardVM } from 'src/app/services/business-hub.service';
import { AuditClickRequestDto, AuditClickResponseDto } from 'src/app/models/business-backend';
import { BusinessHubApi } from 'src/app/services/business-hub.api';

type RatingFilter = 'all' | '4.5' | '4.0' | '3.5';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss'],
})
export class CategoryDetailComponent implements OnInit {
  // route :value (serviceId as string, or 'all')
  category = signal<string>('all');
  serviceName = signal<string>('Business Services');
  pageTitle  = signal<string>('Business Services');

  // query params
  searchQuery = signal<string>('');
  zip         = signal<string>('');

  // ui state
  ratingFilter   = signal<RatingFilter>('all');
  ratingMenuOpen = signal(false);

  // data
  businesses = signal<BusinessCardVM[]>([]);

  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private hub    = inject(BusinessHubService);
  private api    = inject(BusinessHubApi);

  ngOnInit(): void {
    // watch :value
    this.route.paramMap.subscribe((params) => {
      const val = params.get('value') ?? 'all';
      this.category.set(val);

      const asNum = Number(val);
      if (!Number.isNaN(asNum)) {
        this.hub.getServiceName(asNum).subscribe({
          next: (name) => {
            const n = name || 'Services';
            this.serviceName.set(n);
            this.pageTitle.set(n);
          },
          error: () => {
            this.serviceName.set('Services');
            this.pageTitle.set('Services');
          },
        });
      } else {
        this.serviceName.set('All Services');
        this.pageTitle.set('All Services');
      }

      this.fetchFromBackend();
    });

    // watch ?q & ?zip
    this.route.queryParamMap.subscribe((qp) => {
      this.searchQuery.set(qp.get('q') ?? '');
      this.zip.set(qp.get('zip') ?? '');
      this.fetchFromBackend();
    });
  }

  /** Decide which API to call (search vs category list) and normalize to VM[] */
  private fetchFromBackend(): void {
    const q   = this.searchQuery().trim();
    const zip = this.zip().trim();
    const hasFilters = Boolean(q || zip);

    const after = (rows: BusinessCardVM[]) => {
      this.businesses.set(rows ?? []);
      this.populateAvatarsFromGallery(this.businesses());
    };

    if (hasFilters) {
      this.hub
        .searchDirectory({
          q,
          categoryValue: this.category(), // 'all' or serviceId as string
          zip,
          page: 0,
          size: 50,
        })
        .subscribe({
          next: (rows) => after(rows),
          error: () => this.fetchByCategoryFallback(),
        });
      return;
    }

    this.fetchByCategoryFallback();
  }

  /** When no filters, list by category */
  private fetchByCategoryFallback(): void {
    const val = this.category();
    if (!val || val === 'all') {
      this.businesses.set([]);
      return;
    }

    this.hub.getBusinessesByCategory(val).subscribe({
      next: (rows) => {
        this.businesses.set(rows ?? []);
        this.populateAvatarsFromGallery(this.businesses());
      },
      error: () => this.businesses.set([]),
    });
  }

  /** Swap card avatar with first gallery image when available (lazy) */
  private populateAvatarsFromGallery(rows: BusinessCardVM[]) {
    const needs = rows
      .filter((r) => !r.image || r.image.includes('placeholder-business.jpg'))
      .map((r) => r.id);
    if (!needs.length) return;

    forkJoin(needs.map((id) => this.hub.getFirstGalleryImage(id))).subscribe({
      next: (firsts: (string | null)[]) => {
        const copy = [...this.businesses()];
        needs.forEach((id, idx) => {
          const first = firsts[idx];
          if (first) {
            const i = copy.findIndex((b) => b.id === id);
            if (i >= 0) copy[i] = { ...copy[i], image: first };
          }
        });
        this.businesses.set(copy);
      },
      error: () => { /* ignore */ },
    });
  }

  // ===================== UI Hooks =====================
  onBack(): void {
    this.router.navigate(['apps/business-hub']);
  }

  onJoinNow(): void {
    this.router.navigate(['/register']);
  }

  onSearchInput(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }

  onSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.searchQuery() || null, zip: this.zip() || null },
      queryParamsHandling: 'merge',
    });
  }

  setRatingFilter(v: RatingFilter): void {
    this.ratingFilter.set(v);
    this.ratingMenuOpen.set(false);
    this.fetchFromBackend();
  }

  ratingLabel(): string {
    return this.ratingFilter() === 'all' ? 'All Ratings' : `${this.ratingFilter()}+`;
  }

  getStarsArray(r: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.floor(r) ? 1 : 0));
  }

  getShortAddress(address: string): string {
    return (address || '').split(',')[0];
  }

  filteredBusinesses(): BusinessCardVM[] {
    return this.businesses();
  }

  /** Click → optional audit → navigate to detail */
  onBusinessDetail(id: number): void {
    const biz = this.businesses().find((b) => b.id === id);
    const ownerId = biz?.ownerId ?? null;

    const body: AuditClickRequestDto = {
      businessId: id,
      ownerId,
      sessionId: sessionStorage.getItem('sessionId') || `session-${Date.now()}`,
    };

    // Only call if the API actually exposes it (keeps compile-time clean)
    const trackFn = (this.api as any)?.trackClick as
      | ((dto: AuditClickRequestDto) => Observable<AuditClickResponseDto>)
      | undefined;

    if (typeof trackFn === 'function') {
      trackFn.call(this.api, body).subscribe({
        next: () => this.router.navigate(['apps/business/id', id]),
        error: () => this.router.navigate(['apps/business/id', id]),
      });
    } else {
      this.router.navigate(['apps/business/id', id]);
    }
  }
}
