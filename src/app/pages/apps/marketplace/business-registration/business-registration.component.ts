// marketplace/business-registration/business-registration.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BusinessHubService } from 'src/app/services/business-hub.service';
import { BusinessHubApi
  } from 'src/app/services/business-hub.api';

type SimpleOption = { id: number; name: string };

@Component({
  selector: 'app-business-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './business-registration.component.html',
  styleUrls: ['./business-registration.component.scss']
})
export class BusinessRegistrationComponent {
  currentStep = signal(0);
  isSubmitting = signal(false);
  userChoiceMade = signal(false);

  steps = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

  serviceTypes: SimpleOption[] = [];
  selectedServiceId?: number;

  formData = {
    firstName: '', lastName: '', email: '', phone: '',
    businessName: '', description: '', yearsExperience: '',
    address: '', city: '', zipCode: '', website: '', hours: '',
    isPreviousUser: false,
    businessImages: [] as File[]
  };

  constructor(private hub: BusinessHubService, private api: BusinessHubApi, private router: Router) {
    this.api.listCategoriesVM().subscribe(list => {
      this.serviceTypes = list;
      if (list.length) this.selectedServiceId = list[0].id;
    });
  }

  onClose(): void { this.router.navigate(['/apps/business-hub']); }

  nextStep(): void {
    if (this.currentStep() < this.steps.length - 1 && this.isCurrentStepValid()) {
      this.currentStep.update(s => s + 1);
    }
  }
  prevStep(): void {
    if (this.currentStep() > 0) this.currentStep.update(s => s - 1);
  }

  setPreviousUser(isPrev: boolean): void {
    this.formData.isPreviousUser = isPrev;
    this.userChoiceMade.set(true);
  }

  isCurrentStepValid(): boolean {
    switch (this.currentStep()) {
      case 0: return !!(this.formData.email?.trim() && this.userChoiceMade());
      case 1: return !!(this.formData.firstName?.trim() && this.formData.lastName?.trim() && this.formData.phone?.trim());
      case 2: return !!(this.formData.businessName?.trim() && this.selectedServiceId && this.formData.yearsExperience?.trim());
      case 3: return !!(this.formData.address?.trim() && this.formData.city?.trim() && this.formData.zipCode?.trim());
      case 4: return true;
      default: return false;
    }
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    this.formData.businessImages = [...this.formData.businessImages, ...Array.from(input.files)];
  }

  getImagePreview(file: File): string { return URL.createObjectURL(file); }
  removeImage(i: number): void { this.formData.businessImages.splice(i, 1); }

  private yearsFromRange(s: string): number | null {
    const map: Record<string, number> = { '0-1':1, '2-5':3, '6-10':8, '11-20':15, '20+':20 };
    return map[s] ?? null;
  }

  submitRegistration(): void {
    if (!this.isCurrentStepValid() || this.isSubmitting()) return;
    if (!this.selectedServiceId) { alert('Please select a service type'); return; }

    this.isSubmitting.set(true);

    const payload = {
      owner: {
        firstName: this.formData.firstName.trim(),
        lastName:  this.formData.lastName.trim(),
        email:     this.formData.email.trim(),
        phone:     this.formData.phone.trim()
      },
      business: {
        serviceId: this.selectedServiceId,
        businessName: this.formData.businessName.trim(),
        serviceDescription: this.formData.description?.trim() || '',
        yearsInBusiness: this.yearsFromRange(this.formData.yearsExperience),
        businessAddress: this.formData.address?.trim(),
        city: this.formData.city?.trim(),
        zipCode: this.formData.zipCode?.trim(),
        websiteUrl: this.formData.website?.trim(),
        businessHours: this.formData.hours?.trim()
      },
      images: this.formData.businessImages
    };

    this.hub.registerBusinessAndOwner(payload).subscribe({
      next: ({ res, images }) => {
        const businessId = res?.business?.businessId;
        if (businessId && images?.length) {
          this.hub.uploadImages(businessId, images).subscribe();
        }
        alert('Registration submitted successfully!');
        this.router.navigate(['/hub']);
      },
      error: () => { alert('Registration failed. Please try again.'); },
      complete: () => this.isSubmitting.set(false)
    });
  }
}
