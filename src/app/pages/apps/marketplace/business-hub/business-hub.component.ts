import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BusinessHubService } from 'src/app/services/business-hub.service';
import { Category } from 'src/app/services/apps/interfaces/business.interface';

@Component({
  selector: 'app-business-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-hub.component.html',
  styleUrls: ['./business-hub.component.scss']
})
export class BusinessHubComponent implements OnInit {
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

  constructor(private hub: BusinessHubService, private router: Router) {}

  ngOnInit(): void {
    this.hub.getCategories().subscribe(cats => this.categories.set(cats));
  }

  // <-- add this to satisfy (click)="onBack()"
  onBack(): void {
    // If you truly want to go back:
    // history.length ? history.back() : this.router.navigate(['/hub']);
    this.router.navigate(['apps/hub']);
  }

  onJoinNow(): void {
    this.router.navigate(['apps/register']);
  }

  onCategoryClick(value: string): void {
    this.router.navigate(['apps/category', value]);
  }

  onSearchInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.searchQuery.set(v);
  }
  onCategorySelect(e: Event): void {
    const v = (e.target as HTMLSelectElement).value || 'all';
    this.selectedCategory.set(v);
  }
  onZipCodeInput(e: Event): void {
    const raw = (e.target as HTMLInputElement).value || '';
    const cleaned = raw.replace(/\D+/g, '').slice(0, 5);
    this.zipCode.set(cleaned);
  }

  onSearch(): void {
    const cat = this.selectedCategory();
    if (cat && cat !== 'all') {
      this.router.navigate(['/category', cat], {
        queryParams: {
          q: this.searchQuery().trim() || null,
          zip: this.zipCode() || null
        },
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate(['/hub'], {
        queryParams: {
          q: this.searchQuery().trim() || null,
          zip: this.zipCode() || null
        },
        queryParamsHandling: 'merge'
      });
    }
  }
}
