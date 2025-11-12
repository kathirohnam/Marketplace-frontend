// loading.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private requestCount = 0;
  loading$ = signal<boolean>(false);
  loadingMessage$ = signal<string>('');

  show(message?: string): void {
    if (++this.requestCount === 1) this.loading$.set(true);
    if (message) this.loadingMessage$.set(message);
  }

  hide(): void {
    if (this.requestCount > 0 && --this.requestCount === 0) {
      this.loading$.set(false);
      this.loadingMessage$.set('');
    }
  }

  /** 🔧 Force-stop loader (used on route change cancel) */
  reset(): void {
    this.requestCount = 0;
    this.loading$.set(false);
    this.loadingMessage$.set('');
  }
}
