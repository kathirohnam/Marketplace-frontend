import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-testimonials',
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './testimonials.component.html',
    styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'TechStart Solutions LLC',
      industry: 'Technology Consulting',
      rating: 5,
      location: 'Austin, TX',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      quote: 'Outstanding service from start to finish. The team guided me through every step of forming my consulting LLC, and their registered agent service has been absolutely reliable. Filed in under 24 hours as promised, and the ongoing compliance support is worth every penny. Highly professional and responsive.',
      highlight: 'Filed in 24 hours',
      verified: true
    },
    {
      name: 'Michael Rodriguez',
      company: 'Coastal Investment Group LLC',
      industry: 'Real Estate Investment',
      rating: 5,
      location: 'Miami, FL',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      quote: 'After researching multiple formation services, I chose them for their transparent pricing and comprehensive packages. The Pro package included everything I needed - EIN, operating agreement, and banking setup assistance. Customer support responded within hours, not days. Professional service throughout.',
      highlight: 'Comprehensive Pro package',
      verified: true
    },
    {
      name: 'Emily Chen',
      company: 'Creative Studio Collective LLC',
      industry: 'Design & Marketing',
      rating: 5,
      location: 'Portland, OR',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      quote: 'Exceptional experience forming my creative agency. They handled all the paperwork perfectly while I focused on my clients. The registered agent service gives me peace of mind, and their compliance calendar ensures I never miss important deadlines. Worth every cent.',
      highlight: 'Focus on clients',
      verified: true
    },
    {
      name: 'David Thompson',
      company: 'Thompson Consulting LLC',
      industry: 'Business Advisory',
      rating: 5,
      location: 'Denver, CO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      quote: 'I\'ve recommended this service to 8+ colleagues, and every single one has been thrilled with the results. Fast, efficient, and their ongoing support is unmatched in the industry. The lifetime compliance support alone makes them stand out from competitors.',
      highlight: 'Recommended to 8+ colleagues',
      verified: true
    },
    {
      name: 'Jessica Martinez',
      company: 'Wellness Works LLC',
      industry: 'Health & Wellness',
      rating: 5,
      location: 'San Diego, CA',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      quote: 'Making the leap from employee to business owner felt overwhelming until I found this service. They made company formation completely stress-free with crystal-clear communication and transparent pricing. No hidden fees, no surprises - just excellent, professional service.',
      highlight: 'Stress-free experience',
      verified: true
    },
    {
      name: 'Robert Kim',
      company: 'Digital Growth Partners LLC',
      industry: 'Digital Marketing',
      rating: 5,
      location: 'Seattle, WA',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      quote: 'Speed and efficiency are crucial in my business, and they delivered beyond expectations. Same-day expedited filing meant I could start serving clients immediately. Their customer support team is knowledgeable, helpful, and genuinely cares about your success.',
      highlight: 'Same-day filing',
      verified: true
    },
    {
      name: 'Amanda Foster',
      company: 'Foster Financial LLC',
      industry: 'Financial Services',
      rating: 5,
      location: 'Charlotte, NC',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
      quote: 'As a financial advisor, I needed a formation service I could trust completely. Their attention to detail is impeccable - every document was perfect, filing was seamless, and their registered agent service is completely reliable. Exceptional professionalism throughout.',
      highlight: 'Impeccable attention to detail',
      verified: true
    },
    {
      name: 'Carlos Rivera',
      company: 'Rivera Construction LLC',
      industry: 'Construction',
      rating: 5,
      location: 'Phoenix, AZ',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
      quote: 'Outstanding value for money. The Premium package included everything I needed to get started - from formation to banking setup to ongoing compliance support. Customer service is responsive and knowledgeable. I\'d choose them again without hesitation.',
      highlight: 'Outstanding value',
      verified: true
    }
  ];

  stats = [
    {
      number: '150,000+',
      label: 'LLCs Successfully Formed',
      icon: 'business'
    },
    {
      number: '4.9/5',
      label: 'Trustpilot Rating',
      icon: 'star'
    },
    {
      number: '98%',
      label: 'Customer Satisfaction',
      icon: 'thumb_up'
    },
    {
      number: '50',
      label: 'States Covered',
      icon: 'public'
    }
  ];

  currentTestimonial = 0;
  private intervalId: any;

  ngOnInit() {
    // Auto-rotate testimonials every 8 seconds
    this.intervalId = setInterval(() => {
      this.nextTestimonial();
    }, 8000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextTestimonial() {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
  }

  prevTestimonial() {
    this.currentTestimonial = this.currentTestimonial === 0 
      ? this.testimonials.length - 1 
      : this.currentTestimonial - 1;
  }

  selectTestimonial(index: number) {
    this.currentTestimonial = index;
    // Reset auto-rotation when user manually selects
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.nextTestimonial();
      }, 8000);
    }
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  // Get testimonials for grid display (excluding current featured one)
  getGridTestimonials() {
    return this.testimonials.filter((_, index) => index !== this.currentTestimonial).slice(0, 3);
  }
}
