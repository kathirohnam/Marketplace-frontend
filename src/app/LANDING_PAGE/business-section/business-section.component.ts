import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-business-section',
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './business-section.component.html',
    styleUrls: ['./business-section.component.scss']
})
export class BusinessSectionComponent {
  services = [
    {
      icon: 'business',
      title: 'LLC Formation',
      description: 'Complete LLC formation with state filing, registered agent, and all required documents.',
      price: '$49',
      features: ['State Filing', 'Registered Agent', 'Operating Agreement', 'EIN Number']
    },
    {
      icon: 'account_balance',
      title: 'Corporation Formation',
      description: 'Incorporate your business with professional guidance and comprehensive support.',
      price: '$99',
      features: ['Articles of Incorporation', 'Corporate Bylaws', 'Stock Certificates', 'Board Resolutions']
    },
    {
      icon: 'gavel',
      title: 'Legal Compliance',
      description: 'Stay compliant with ongoing legal requirements and annual filings.',
      price: '$29/year',
      features: ['Annual Reports', 'Good Standing Certificate', 'Amendment Services', 'Dissolution Services']
    }
  ];

  benefits = [
    {
      icon: 'security',
      title: 'Asset Protection',
      description: 'Protect your personal assets from business liabilities with proper business structure.'
    },
    {
      icon: 'account_balance_wallet',
      title: 'Tax Benefits',
      description: 'Take advantage of business tax deductions and flexible tax treatment options.'
    },
    {
      icon: 'trending_up',
      title: 'Business Credit',
      description: 'Build business credit separate from your personal credit to access better financing.'
    },
    {
      icon: 'verified',
      title: 'Professional Image',
      description: 'Establish credibility with customers, vendors, and partners with a formal business entity.'
    }
  ];
}
