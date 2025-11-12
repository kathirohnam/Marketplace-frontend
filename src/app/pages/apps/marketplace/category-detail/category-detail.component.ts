// marketplace/category-detail/category-detail.component.ts
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessHubService, BusinessCardVM } from 'src/app/services/business-hub.service';

type RatingFilter = 'all' | '4.5' | '4.0' | '3.5';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent implements OnInit {
  // from route param
  category = signal<string>(''); // serviceId as string
  searchQuery = signal('');
  businesses = signal<BusinessCardVM[]>([]);

  ratingFilter = signal<RatingFilter>('all');
  ratingMenuOpen = signal(false);

  filteredBusinesses = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const min = this.ratingFilter() === 'all' ? 0 : parseFloat(this.ratingFilter());
    return this.businesses().filter(b => {
      const matchesQuery = !q || b.name.toLowerCase().includes(q)
        || b.description.toLowerCase().includes(q);
      return matchesQuery && b.rating >= min;
    });
  });

  constructor(private hub: BusinessHubService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const cat = params.get('category') ?? '';
      this.category.set(cat);
      this.fetch();
    });

    // Optional: consume query params (q, zip) if needed
    this.route.queryParamMap.subscribe(qp => {
      const q = qp.get('q') ?? '';
      this.searchQuery.set(q);
      // const zip = qp.get('zip'); // if you want to use it to refine API
    });
  }

  private fetch() {
    this.hub.getBusinessesByCategory(this.category()).subscribe(biz => this.businesses.set(biz));
  }

  onBack(): void { this.router.navigate(['/hub']); }
  onJoinNow(): void { this.router.navigate(['/register']); }
  onBusinessDetail(id: number): void { this.router.navigate(['/business', id]); }

  onSearchInput(e: Event): void { this.searchQuery.set((e.target as HTMLInputElement).value); }
  onSearch(): void {} // no-op (filtering is local now)

  setRatingFilter(v: RatingFilter): void { this.ratingFilter.set(v); this.ratingMenuOpen.set(false); }
  ratingLabel(): string { return this.ratingFilter() === 'all' ? 'All Ratings' : `${this.ratingFilter()}+`; }
  getStarsArray(r: number): number[] { return Array.from({ length: 5 }, (_, i) => (i < Math.floor(r) ? 1 : 0)); }
  getShortAddress(address: string): string { return (address || '').split(',')[0]; }
}
