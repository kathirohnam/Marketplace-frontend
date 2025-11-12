import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-footer',
    imports: [CommonModule, MatIconModule, RouterModule],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  footerLinks = {
    services: [
      { name: 'LLC Formation', href: '#' },
      { name: 'Corporation Formation', href: '#' },
      { name: 'Registered Agent', href: '#' },
      { name: 'EIN Application', href: '#' },
      { name: 'Operating Agreement', href: '#' },
      { name: 'Annual Report Filing', href: '#' }
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'How It Works', href: 'how-it-works' },
      { name: 'Pricing', href: 'pricing' },
      { name: 'Reviews', href: 'testimonials' },
      { name: 'Features', href: 'features' },
      { name: 'Contact Us', href: 'faq' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Disclaimer', href: '#' },

      { name: 'Security', href: '#' }
    ]
  };

  socialLinks = [
    { name: 'Facebook', icon: 'facebook', href: '#' },
    { name: 'Twitter', icon: 'twitter', href: '#' },
    { name: 'LinkedIn', icon: 'linkedin', href: '#' },
    { name: 'Instagram', icon: 'instagram', href: '#' }
  ];

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}