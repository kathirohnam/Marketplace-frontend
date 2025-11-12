// marketplace/business-detail/business-detail.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessHubService,DetailedBusinessVM } from 'src/app/services/business-hub.service';

@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-detail.component.html',
  styleUrls: ['./business-detail.component.scss']
})
export class BusinessDetailComponent implements OnInit {
  isSaved = signal(false);
  activeTab = signal<'overview' | 'reviews' | 'gallery'>('overview');
  business = signal<DetailedBusinessVM | null>(null);

  tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews',  label: 'Reviews'  },
    { id: 'gallery',  label: 'Gallery'  }
  ] as const;

  constructor(private hub: BusinessHubService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => {
      const id = Number(p.get('id'));
      if (!id) return;
      this.hub.getBusinessById(id).subscribe(b => this.business.set(b));
    });
  }

  onBack(): void { this.router.navigate(['/hub']); }
  onJoinNow(): void { this.router.navigate(['/register']); }
  toggleSave(): void { this.isSaved.set(!this.isSaved()); }

  shareBusiness(): void {
    const b = this.business();
    if (!b) return;
    if (navigator.share) navigator.share({ title: b.name, text: b.description, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!'); }
  }

  setActiveTab(tabId: 'overview' | 'reviews' | 'gallery'): void {
    this.activeTab.set(tabId);
  }
  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.floor(rating) ? 1 : 0));
  }
}
