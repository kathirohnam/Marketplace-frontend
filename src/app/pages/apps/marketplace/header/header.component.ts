// marketplace/header/header.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export type TabId = 'home' | 'services' | 'about' | 'contact';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() activeTab: TabId = 'home';
  @Output() tabSelected = new EventEmitter<TabId>();
  @Output() joinNowClicked = new EventEmitter<void>();

  constructor(private router: Router) {}

  onJoinNow(): void {
    this.joinNowClicked.emit();
    this.router.navigate(['/register']);
  }

  select(tab: TabId): void {
    this.activeTab = tab;
    this.tabSelected.emit(tab);
    switch (tab) {
      case 'home': this.router.navigate(['/hub']); break;
      case 'services': this.router.navigate(['/hub']); break; // or a dedicated route if you have one
      case 'about': this.router.navigate(['/hub']); break;    // placeholder
      case 'contact': this.router.navigate(['/hub']); break;  // placeholder
    }
  }
}
