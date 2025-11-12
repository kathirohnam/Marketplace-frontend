import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-hero-section',
    imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
    templateUrl: './hero-section.component.html',
    styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  currentStep = 1;
  progressPercentage = 60;
  private progressInterval: any;

  heroFeatures = [
    { icon: 'verified', text: 'State filing fees included' },
    { icon: 'support_agent', text: 'Handle registered agent service' },
    { icon: 'description', text: 'Operating agreement template' },
    { icon: 'schedule', text: 'Fast 24-hour processing' }
  ];

  formationSteps = [
    {
      title: 'Business Name Verified',
      description: 'Name availability confirmed'
    },
    {
      title: 'State Filing Submitted',
      description: 'Documents filed with state'
    },
    {
      title: 'Processing Registration',
      description: 'State reviewing application'
    },
    {
      title: 'Documents Ready',
      description: 'LLC certificate prepared'
    }
  ];

  floatingBenefits = [
    {
      icon: 'business_center',
      title: 'LLC Certificate',
      description: 'Official state document'
    },
    {
      icon: 'security',
      title: 'Legal Protection',
      description: 'Personal asset protection'
    },
    {
      icon: 'savings',
      title: 'Tax Benefits',
      description: 'Flexible tax options'
    }
  ];

  trustIndicators = [
    {
      icon: 'security',
      title: 'Bank-Level Security',
      description: 'Your data is protected with 256-bit SSL encryption'
    },
    {
      icon: 'support_agent',
      title: 'Expert Support',
      description: 'Get help from our business formation specialists'
    },
    {
      icon: 'verified',
      title: '100% Accuracy',
      description: 'We guarantee error-free filing or your money back'
    },
    {
      icon: 'schedule',
      title: 'Fast Processing',
      description: 'Most LLCs are processed within 24-48 hours'
    }
  ];

  ngOnInit() {
    // Simulate progress animation
    this.startProgressAnimation();
  }

  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  private startProgressAnimation() {
    // Animate progress bar and steps
    setTimeout(() => {
      this.progressPercentage = 75;
    }, 2000);

    setTimeout(() => {
      this.currentStep = 2;
      this.progressPercentage = 90;
    }, 4000);

    // Reset animation cycle
    this.progressInterval = setInterval(() => {
      this.currentStep = 1;
      this.progressPercentage = 60;
      
      setTimeout(() => {
        this.progressPercentage = 75;
      }, 2000);

      setTimeout(() => {
        this.currentStep = 2;
        this.progressPercentage = 90;
      }, 4000);
    }, 8000);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}