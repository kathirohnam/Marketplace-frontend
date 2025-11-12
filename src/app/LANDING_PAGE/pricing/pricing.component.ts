import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-pricing',
    imports: [CommonModule, MatIconModule, MatButtonModule],
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.scss']
})
export class PricingComponent {
  pricingPlans = [
    {
      name: 'Basic',
      price: 0,
      originalPrice: 99,
      badge: 'Free',
      description: 'Perfect for getting started with your LLC',
      features: [
        'LLC Name Search & Availability Check',
        'Prepare & File Articles of Organization',
        'State Filing Included (State fees additional)',
        'Operating Agreement Template',
        'Email Customer Support',
        'Online Dashboard Access',
        'Order Status Tracking'
      ],
      ctaText: 'Start for Free',
      popular: true
    },
    {
      name: 'Standard',
      price: 199,
      originalPrice: 299,
      badge: 'Most Popular',
      description: 'Everything you need to run your LLC professionally',
      features: [
        'Everything in Basic Package',
        'FREE Registered Agent Service (1 Year)',
        'FREE Federal Tax ID (EIN) Filing',
        'Custom Operating Agreement',
        'Business Banking Assistance',
        'Priority Phone & Email Support',
        'Compliance Calendar & Reminders',
        'Annual Report Filing Reminders',
        'Document Storage & Access'
      ],
      ctaText: 'Get Started',
      popular: false
    },
    {
      name: 'Premium',
      price: 399,
      originalPrice: 599,
      badge: 'Full Service',
      description: 'Complete LLC formation with premium business features',
      features: [
        'Everything in Standard Package',
        'Express 24-Hour Processing',
        'Attorney Document Review',
        'Business License Research Report',
        'Domain Name + Professional Email',
        'Business Website Template',
        'Dedicated Account Manager',
        'Lifetime Customer Support',
        'Business Banking Setup Assistance',
        'Tax Consultation Session'
      ],
      ctaText: 'Go Premium',
      popular: false
    }
  ];
}