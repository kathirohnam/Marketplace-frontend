import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators,  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SnackBarService } from 'src/app/shared/snackbar.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { AdminElement,createAdminForm } from 'src/app/models/admin';
import { AdminService } from 'src/app/services/apps/admin/admin.service';
import { ProfileUploadComponent } from 'src/app/shared/profile-upload/profile-upload.component';
import {UserContactInfoComponent} from 'src/app/shared/user-contact-info.component';
import { ADDRESS1_MAX, ADDRESS1_MIN, ADDRESS_PATTERN, CITY_COUNTRY_PATTERN, CITY_MAX, CITY_MIN, COUNTRY_MAX, COUNTRY_MIN, COUNTRY_PATTERN, EIN_PATTERN,EMAIL_PATTERN,NAME_PATTERN, STATE_PATTERN, US_PHONE_PATTERN, ZIP5_PATTERN } from 'src/app/models/regexpattern';


/**
 * Utility function to display snackbar messages.
 */


@Component({
    selector: 'app-admin-add-edit',
    imports: [
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        MatIconModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgxMaskDirective,
        // NgxMaskPipe,
        ProfileUploadComponent,
        UserContactInfoComponent,
    ],
    templateUrl: './admin-add-edit.component.html',
    styles: [
        `
     
      button[disabled] {
        background-color: #d6dbdf !important;
        color: #99a3a4 !important;
        cursor: none;
        opacity: 0.6;
        box-shadow: none !important;
      }
    `,
    ]
})
export class AdminAddEditComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(ProfileUploadComponent)
  profileUploadComponent!: ProfileUploadComponent;

  userForm!: FormGroup;
  editMode = false;
  adminId?: number;
  isVendor = false;
  isSuperFilerOrVendor = false;
  userCompanyId?: number;
  

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBarService: SnackBarService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // 1️⃣ Instant patch from router state
    const nav = this.router.getCurrentNavigation();
    const stateAdmin = nav?.extras.state?.['admin'] as AdminElement | undefined;
    if (stateAdmin) {
      this.editMode = true;
      this.adminId = stateAdmin.id;
      this.userCompanyId = stateAdmin.userCompanyId;
      this.patchForm(stateAdmin);
      return;
    }

    // 2️⃣ Fallback: attempt to read ?id=123
    this.route.queryParams.subscribe((params) => {
      const id = +params['id'];
      if (id) {
        this.editMode = true;
        this.adminId = id;
        this.loadAdminData(id);
      }
    });
  }

  private buildForm(): void {
    this.userForm = createAdminForm(this.fb);
//     this.fb.group({
//       role: ['', Validators.required],
//       firstName: ['', [Validators.required, Validators.pattern("^[A-Za-z]+( [A-Za-z]+)*$")
// ]],
//       lastName: ['', [Validators.required, Validators.pattern("^[A-Za-z]+( [A-Za-z]+)*$")
// ]],
//       phone: [
//         '',
//         [
//           Validators.required,
//           Validators.pattern('^\\(\\d{3}\\) \\d{3}-\\d{4}$'),
//         ],
//       ],
//       email: [
//         '',
//         [
//           Validators.required,
//           Validators.pattern(
//             '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'
//           ),
//         ],
//       ],
//       ein: ['', [Validators.pattern(/^[0-9]{2}-[0-9]{7}$/)]],
//       vendorName: [
//     '',
    
//   ],
//       alternativeName: [''],
//       vendorContactNumber: [
//         '',
//         [
//           Validators.required,
//           Validators.pattern('^\\(\\d{3}\\) \\d{3}-\\d{4}$'),
//         ],
//       ],
//       vendor_email: [
//         '',
//         [
//           Validators.required,
//           Validators.email,
//           Validators.pattern(
//             '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'
//           ),
//         ],
//       ],
//       address: [''],
//       city: [''],
//       state: [
//         '',
//         [Validators.pattern(/^[A-Za-z]{2}$/), Validators.maxLength(2)],
//       ],
//       country: [''],
//       zip: [''],
//       profileImage: [null],
//     });

    this.userForm
      .get('role')!
      .valueChanges.subscribe((role) => this.updateRoleFields(role));
  }
private updateRoleFields(role: string): void {
  this.isVendor = role === 'Vendor';
  this.isSuperFilerOrVendor = this.isVendor || role === 'SuperFiler';

  const vendorFields = [
    'ein',
    'vendorName',
    'vendorContactNumber',
    'vendor_email',
    'address',
    'city',
    'state',
    'country',
    'zip',
  ] as const;

  vendorFields.forEach((name) => {
    const control = this.userForm.get(name)!;

    if (this.isVendor) {
      const validators =
        name === 'ein'
          ? [Validators.required, Validators.pattern(EIN_PATTERN)]
          : name === 'vendor_email'
          ? [Validators.required, Validators.email, Validators.pattern(
            EMAIL_PATTERN
          )]
          : name === 'vendorName'
          ? [Validators.required, Validators.pattern(NAME_PATTERN)]
          : name === 'vendorContactNumber'
          ? [Validators.required, Validators.pattern(US_PHONE_PATTERN)]
          : name === 'city'
          ? [Validators.required, Validators.maxLength(CITY_MAX), Validators.pattern(CITY_COUNTRY_PATTERN),Validators.minLength(CITY_MIN)]
          : name === 'country'
          ? [Validators.required, Validators.maxLength(COUNTRY_MAX), Validators.pattern(COUNTRY_PATTERN),Validators.minLength(COUNTRY_MIN)]
          : name === 'state'
          ? [Validators.required, Validators.pattern(STATE_PATTERN), Validators.maxLength(2)]
          : name === 'zip'
          ? [Validators.required, Validators.pattern(ZIP5_PATTERN)]
          : name === 'address'
          ? [Validators.required, Validators.pattern(ADDRESS_PATTERN), Validators.maxLength(ADDRESS1_MAX),Validators.minLength(ADDRESS1_MIN)]
          : [Validators.required];

      control.setValidators(validators);
    } else {
      control.clearValidators();
    }
    control.updateValueAndValidity({ emitEvent: false });
  });
}


 

  private loadAdminData(id: number): void {
    // if cache empty, fetch all then patch; otherwise, patch directly
    const cached = this.adminService.getCachedAdminById(id);
    if (cached) {
      this.userCompanyId = cached.userCompanyId;
      this.patchForm(cached);
    } else {
      this.adminService.getAdmins().subscribe({
        next: (list) => {
          const found = this.adminService.getCachedAdminById(id);
          if (!found) {
            this.snackBarService.showError('User not found');
            this.router.navigate(['/apps/admin']);
            return;
          }
          this.userCompanyId = found.userCompanyId;
          this.patchForm(found);
        },
        error: () => this.router.navigate(['/apps/admin']),
      });
    }
  }

  private patchForm(admin: AdminElement): void {
    this.userForm.patchValue({
      role: admin.role,
      firstName: admin.firstName,
      lastName: admin.lastName,
      phone: admin.phone,
      email: admin.email,
      ein: admin.ein,
      vendorName: admin.vendorName,
      alternativeName: admin.alternativeName,
      vendorContactNumber: admin.vendorContactNumber,
      vendor_email: admin.vendor_email,
      address: admin.address,
      city: admin.city,
      state: admin.state,
      country: admin.country,
      zip: admin.zip,
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      console.log('Form errors:', this.userForm.errors);

      Object.keys(this.userForm.controls).forEach((key) => {
        const controlErrors = this.userForm.get(key)?.errors;
        if (controlErrors) {
          console.log(`- ${key} errors:`, controlErrors);
        }
      });

      this.userForm.markAllAsTouched();
      this.snackBarService.showError('Please fix form errors');
      return;
    }

    const formValue = this.userForm.value;
    const payload: AdminElement = {
      id: this.adminId,
      role: formValue.role,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phone: formValue.phone,
      email: formValue.email,
      ein: formValue.ein,
      vendorName: formValue.vendorName,
      alternativeName: formValue.alternativeName,
      vendorContactNumber: formValue.vendorContactNumber,
      vendor_email: formValue.vendor_email,
      address: formValue.address,
      city: formValue.city,
      state: formValue.state,
      country: formValue.country,
      zip: formValue.zip,
      userCompanyId: this.editMode ? this.userCompanyId : undefined,
    };

    const operation$ = this.editMode
      ? this.adminService.updateAdmin(payload)
      : this.adminService.addAdmin(payload);

    operation$.subscribe({
      next: () => {
        console.log(payload);
        this.snackBarService.showSuccess(
          this.editMode
            ? 'User updated successfully'
            : 'User added successfully'
        );
        this.router.navigate(['/apps/admin']);
      },
    });
  }

  navigateToAdminList(): void {
    this.router.navigate(['/apps/admin']);
  }
}