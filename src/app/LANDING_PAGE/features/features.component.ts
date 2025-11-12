import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-features',
    imports: [CommonModule, MatIconModule, MatCardModule],
    templateUrl: './features.component.html',
    styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {
  features = [
    {
      icon: 'speed',
      title: 'Fast LLC Formation',
      description: 'Get your LLC formed in as little as 1 business day with our expedited service.',
      highlights: ['Same-day filing available', 'Real-time status updates', 'Express processing']
    },
    {
      icon: 'security',
      title: 'Registered Agent Service',
      description: 'Free registered agent service included for your first year with every LLC package.',
      highlights: ['Professional address', 'Mail forwarding', 'Legal document handling']
    },
    {
      icon: 'description',
      title: 'Operating Agreement',
      description: 'Custom operating agreement template to protect your business interests.',
      highlights: ['Legally binding', 'State-specific', 'Easy to customize']
    },
    {
      icon: 'account_balance',
      title: 'EIN & Tax Setup',
      description: 'We help you obtain your Federal Tax ID and set up your business banking.',
      highlights: ['Free EIN filing', 'Banking recommendations', 'Tax guidance']
    },
    {
      icon: 'support_agent',
      title: '24/7 Expert Support',
      description: 'Our business formation experts are available around the clock to help.',
      highlights: ['Live chat support', 'Phone assistance', 'Email support']
    },
    {
      icon: 'verified',
      title: 'Compliance Monitoring',
      description: 'Never miss important deadlines with our automated compliance reminders.',
      highlights: ['Annual report reminders', 'State compliance tracking', 'Renewal notifications']
    }
  ];
}