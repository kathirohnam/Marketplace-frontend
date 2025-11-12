import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-works',
    imports: [CommonModule, MatIconModule, MatButtonModule],
    templateUrl: './works.component.html',
    styleUrls: ['./works.component.scss']
})
export class WorksComponent {
  steps = [
    {
      number: 1,
      icon: 'edit',
      title: 'Choose Your Business Name',
      description: 'Pick a unique name for your LLC and check availability instantly across all 50 states.',
      details: ['Name availability search', 'Reserve your name', 'Get suggestions if needed']
    },
    {
      number: 2,
      icon: 'description',
      title: 'Complete Formation Documents',
      description: 'Fill out our simple online form with your business information - takes just 5 minutes.',
      details: ['Basic business information', 'Member details', 'Operating agreement preferences']
    },
    {
      number: 3,
      icon: 'send',
      title: 'We File With The State Authority',
      description: 'Our experts review and file your Articles of Organization with your state government.',
      details: ['Expert document review', 'State filing submission', 'Real-time status tracking']
    },
    {
      number: 4,
      icon: 'check_circle',
      title: 'Get Your LLC Documents',
      description: 'Receive your official LLC documents and start operating your business legally.',
      details: ['Certificate of Formation', 'Operating Agreement', 'EIN confirmation']
    }
  ];

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}