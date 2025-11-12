// src/app/pages/apps/marketplace/business-registration/business-registration.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

// If you have these services, keep the imports; otherwise adjust paths or stub.
import { BusinessHubApi } from 'src/app/services/business-hub.api';
import { BusinessHubService } from 'src/app/services/business-hub.service';

type Option = { label: string; value: string | number };
type StateOption = { label: string; value: string };

@Component({
  selector: 'app-business-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './business-registration.component.html',
  styleUrls: ['./business-registration.component.scss'],
})
export class BusinessRegistrationComponent implements OnInit {

  // --- UI state ---
  showSuccess = false;
  isSubmitting = false;

  // --- Form model (matches your HTML bindings) ---
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;

    businessName: string;
    businessService: number | '';// service id
    website: string;
    yearsInBusiness: number | '';// numeric in payload
    serviceDescription: string;
    businessHours: string;

    address: string;
    city: string;
    state: string;              // state abbr
    zipCode: string;
  } = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',

    businessName: '',
    businessService: '',
    website: '',
    yearsInBusiness: '',
    serviceDescription: '',
    businessHours: '',

    address: '',
    city: '',
    state: '',
    zipCode: '',
  };

  // --- Select options (bound in template) ---
  serviceTypes: Option[] = [];       // from API or fallback
  yearsOptions: Option[] = [
    { label: '0–1 years', value: 1 },
    { label: '2–5 years', value: 3 },
    { label: '6–10 years', value: 8 },
    { label: '11–20 years', value: 15 },
    { label: '20+ years', value: 20 },
  ];
  usStates: StateOption[] = [];      // from API or fallback

  // --- Images (previews + originals) ---
  uploadedImages: string[] = [];     // data URLs for preview
  private uploadedFiles: File[] = []; // actual files to upload

  constructor(
    private router: Router,
    private api: BusinessHubApi,
    private hub: BusinessHubService
  ) {}

  ngOnInit(): void {
    // 1) Load service categories
    this.api.listCategoriesVM().subscribe({
      next: (list: any[] | null) => {
        // Expecting [{id, name}] -> map to {label,value}
        this.serviceTypes = (list || []).map(c => ({ label: c.name, value: c.id }));
      },
      error: () => {
        // Fallback seed
        this.serviceTypes = [
          { label: 'General Services', value: 1 },
          { label: 'Consulting', value: 2 },
          { label: 'Home Repair', value: 3 },
        ];
      },
    });

    // 2) Load US states if API exists; else fallback static
    const maybeStates = (this.api as any).listStatesVM;
    if (typeof maybeStates === 'function') {
      (this.api as any).listStatesVM().subscribe({
        next: (arr: { abbr: string; name: string }[]) => {
          this.usStates = (arr || []).map(s => ({ label: s.name, value: s.abbr }));
        },
        error: () => this.usStates = this.staticStates(),
      });
    } else {
      this.usStates = this.staticStates();
    }
  }

  // -------- Template handlers --------
  onBack(): void {
    this.router.navigate(['/apps/business-hub']);
  }

  onImageUpload(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    files.forEach(file => {
      // cap ~10MB per your hint
      if (file.size > 10 * 1024 * 1024) return;

      this.uploadedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.uploadedImages.push(reader.result);
        }
      };
      reader.readAsDataURL(file);
    });

    // clear input so the same file can be picked again if needed
    input.value = '';
  }

  removeImage(i: number): void {
    if (i < 0 || i >= this.uploadedImages.length) return;
    this.uploadedImages.splice(i, 1);
    this.uploadedFiles.splice(i, 1);
  }

 onSubmit(form?: NgForm): void {
  if (this.isSubmitting) return;
  if (!form || !form.valid) return;

  const p = this.formData;

  // Narrow serviceId to a definite number
  const serviceId = Number(p.businessService);
  if (!Number.isFinite(serviceId) || serviceId <= 0) {
    alert('Please choose a service type.');
    return;
  }

  // Use undefined for optional numeric field to match typical TS shapes
  const years: number | undefined =
    typeof p.yearsInBusiness === 'number' ? p.yearsInBusiness : undefined;

  const payload = {
    owner: {
      firstName: p.firstName.trim(),
      lastName: p.lastName.trim(),
      email: p.email.trim(),
      phone: p.phoneNumber.trim(),
    },
    business: {
      serviceId, // <-- now a definite number
      businessName: p.businessName.trim(),
      serviceDescription: p.serviceDescription?.trim() || '',
      yearsInBusiness: years, // <-- undefined instead of null when empty
      businessAddress: p.address?.trim() || '',
      city: p.city?.trim() || '',
      state: p.state || '',
      zipCode: p.zipCode?.trim() || '',
      websiteUrl: p.website?.trim() || '',
      businessHours: p.businessHours?.trim() || '',
    },
    images: this.uploadedFiles, // optional param is fine
  };

  this.isSubmitting = true;

  this.hub.registerBusinessAndOwner(payload)
    .pipe(finalize(() => (this.isSubmitting = false)))
    .subscribe({
      next: ({ res }: any) => {
        const businessId = res?.business?.businessId;
        if (businessId && this.uploadedFiles.length) {
          this.hub.uploadImages(businessId, this.uploadedFiles).subscribe();
        }
        this.showSuccess = true;
        setTimeout(() => this.router.navigate(['/apps/business-hub']), 2200);
      },
      error: () => alert('Registration failed. Please try again.'),
    });
}


  // -------- Helpers --------
  private staticStates(): StateOption[] {
    return [
      { label: 'Alabama', value: 'AL' }, { label: 'Alaska', value: 'AK' },
      { label: 'Arizona', value: 'AZ' }, { label: 'Arkansas', value: 'AR' },
      { label: 'California', value: 'CA' }, { label: 'Colorado', value: 'CO' },
      { label: 'Connecticut', value: 'CT' }, { label: 'Delaware', value: 'DE' },
      { label: 'Florida', value: 'FL' }, { label: 'Georgia', value: 'GA' },
      { label: 'Hawaii', value: 'HI' }, { label: 'Idaho', value: 'ID' },
      { label: 'Illinois', value: 'IL' }, { label: 'Indiana', value: 'IN' },
      { label: 'Iowa', value: 'IA' }, { label: 'Kansas', value: 'KS' },
      { label: 'Kentucky', value: 'KY' }, { label: 'Louisiana', value: 'LA' },
      { label: 'Maine', value: 'ME' }, { label: 'Maryland', value: 'MD' },
      { label: 'Massachusetts', value: 'MA' }, { label: 'Michigan', value: 'MI' },
      { label: 'Minnesota', value: 'MN' }, { label: 'Mississippi', value: 'MS' },
      { label: 'Missouri', value: 'MO' }, { label: 'Montana', value: 'MT' },
      { label: 'Nebraska', value: 'NE' }, { label: 'Nevada', value: 'NV' },
      { label: 'New Hampshire', value: 'NH' }, { label: 'New Jersey', value: 'NJ' },
      { label: 'New Mexico', value: 'NM' }, { label: 'New York', value: 'NY' },
      { label: 'North Carolina', value: 'NC' }, { label: 'North Dakota', value: 'ND' },
      { label: 'Ohio', value: 'OH' }, { label: 'Oklahoma', value: 'OK' },
      { label: 'Oregon', value: 'OR' }, { label: 'Pennsylvania', value: 'PA' },
      { label: 'Rhode Island', value: 'RI' }, { label: 'South Carolina', value: 'SC' },
      { label: 'South Dakota', value: 'SD' }, { label: 'Tennessee', value: 'TN' },
      { label: 'Texas', value: 'TX' }, { label: 'Utah', value: 'UT' },
      { label: 'Vermont', value: 'VT' }, { label: 'Virginia', value: 'VA' },
      { label: 'Washington', value: 'WA' }, { label: 'West Virginia', value: 'WV' },
      { label: 'Wisconsin', value: 'WI' }, { label: 'Wyoming', value: 'WY' },
    ];
  }
}
