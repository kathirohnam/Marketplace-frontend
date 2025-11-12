import { Component, OnInit, DestroyRef, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BusinessHubService, DetailedBusinessVM } from 'src/app/services/business-hub.service';
import { BusinessHubApi } from 'src/app/services/business-hub.api';

type TabId = 'overview' | 'reviews' | 'gallery';

// NOTE: minimal shape we might get from the API for each image
type BusinessImageLike =
  | string
  | { url?: string; imageUrl?: string; s3Url?: string; cdnUrl?: string; [k: string]: any };

@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-detail.component.html',
  styleUrls: ['./business-detail.component.scss'],
})
export class BusinessDetailComponent implements OnInit {
  isSaved = signal(false);
  activeTab = signal<TabId>('overview');
  business = signal<DetailedBusinessVM | null>(null);

  galleryLoading = signal(false);
  galleryError = signal<string | null>(null);
  private inFlight = false;

  private hub = inject(BusinessHubService);
  private api = inject(BusinessHubApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'gallery', label: 'Gallery' },
  ] as const;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((p) => {
        const id = Number(p.get('id'));
        if (!id) return;

        this.hub
          .getBusinessById(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((b) => {
            this.business.set(b);
            if (b?.id != null) {
              this.loadGalleryAndSetHero(b.id, b.image);
            }
          });
      });
  }

  /**
   * Convert any "image-like" item to a URL string if possible.
   */
  private toUrl(item: BusinessImageLike): string | null {
    if (typeof item === 'string') return item;
    return item.url || item.imageUrl || item.s3Url || item.cdnUrl || null;
  }

  /**
   * Always fetch gallery and set:
   *   - image (hero) = first gallery URL if found; else fallbackHero; else keep current
   *   - gallery = array of string URLs
   */
  private loadGalleryAndSetHero(businessId: number, fallbackHero?: string): void {
    if (this.inFlight) return;
    this.inFlight = true;
    this.galleryLoading.set(true);
    this.galleryError.set(null);

    this.api
      .listImages(businessId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items: BusinessImageLike[] | null | undefined) => {
          const b = this.business();
          const galleryUrls =
            (items ?? [])
              .map((it) => this.toUrl(it))
              .filter((u): u is string => !!u) || [];

          if (b) {
            const hero: string =
              galleryUrls[0] ?? fallbackHero ?? b.image ?? '';
            this.business.set({
              ...b,
              image: hero,
              gallery: galleryUrls,
            });
          }

          this.galleryLoading.set(false);
          this.inFlight = false;
        },
        error: (err) => {
          console.error('Failed to load gallery', err);
          const b = this.business();
          if (b) {
            this.business.set({
              ...b,
              image: fallbackHero ?? b.image ?? '',
              gallery: (b.gallery as string[]) ?? [],
            });
          }
          this.galleryError.set('Failed to load images. Please try again.');
          this.galleryLoading.set(false);
          this.inFlight = false;
        },
      });
  }

  setActiveTab(tabId: TabId): void {
    this.activeTab.set(tabId);
  }

  onBack(): void {
    if (history.length > 1) history.back();
    else this.router.navigate(['/apps/business-hub']);
  }

  onJoinNow(): void {
    this.router.navigate(['/apps/register']);
  }

  toggleSave(): void {
    this.isSaved.set(!this.isSaved());
  }

  shareBusiness(): void {
    const b = this.business();
    if (!b) return;
    if (navigator.share) {
      navigator.share({ title: b.name, text: b.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.floor(rating) ? 1 : 0));
  }
}
