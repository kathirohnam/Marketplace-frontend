import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';  
import { AppNavbarComponent } from '../navbar/navbar.component';
import { FeaturesComponent } from '../features/features.component';
import { PricingComponent } from '../pricing/pricing.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';
import { HeroSectionComponent } from '../hero-section/hero-section/hero-section.component';
import { FaqComponent } from '../faq/faq.component';
import { WorksComponent } from '../works/works/works.component';
import { FooterComponent } from '../footer/footer.component';
import { BusinessSectionComponent } from '../business-section/business-section.component';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss'],
    encapsulation: ViewEncapsulation.None, // ⬅️ allow styles to reach children
    host: { class: 'landing-scope' },
    imports: [
        AppNavbarComponent,
        HeroSectionComponent,
        FeaturesComponent,
        PricingComponent,
        TestimonialsComponent,
        FaqComponent,
        WorksComponent,
        FooterComponent,
        BusinessSectionComponent
    ]
})
export class LandingPageComponent implements OnInit {
  isMobile = false;
  isTablet = false;
  isDesktop = false;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpointObserver.observe([
      Breakpoints.XSmall, // Extra small screens (phones)
      Breakpoints.Small,  // Small screens (tablets in portrait)
      Breakpoints.Medium, // Medium screens (tablets in landscape)
      Breakpoints.Large,  // Large screens (desktops)
      Breakpoints.XLarge  // Extra-large screens
    ]).subscribe(result => {
      this.isMobile = result.breakpoints[Breakpoints.XSmall] || result.breakpoints[Breakpoints.Small];
      this.isTablet = result.breakpoints[Breakpoints.Medium];
      this.isDesktop = result.breakpoints[Breakpoints.Large] || result.breakpoints[Breakpoints.XLarge];
    });
  }
}
