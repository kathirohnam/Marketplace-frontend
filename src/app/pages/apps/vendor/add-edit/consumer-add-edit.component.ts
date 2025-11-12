import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsumerService } from 'src/app/services/apps/vendor/consumer-service';
import { SnackBarService } from 'src/app/shared/snackbar.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { first } from 'rxjs/operators';
import { ConsumerElement,createConsumerForm } from 'src/app/models/consumer';
import { ProfileUploadComponent } from 'src/app/shared/profile-upload/profile-upload.component';
import { UserContactInfoComponent } from 'src/app/shared/user-contact-info.component';

/**
 * Component to add or edit a consumer
 */
@Component({
    selector: 'app-consumer-add-edit',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        // NgxMaskDirective,
        // NgxMaskPipe,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        MatIconModule,
        ProfileUploadComponent,
        UserContactInfoComponent,
    ],
    templateUrl: './consumer-add-edit.component.html',
    styles: [`::ng-deep .mat-mdc-form-field-error {
  text-align: end !important;
  width: 100%;
  display: block;
  padding-right: 15px;
}
   button[disabled] {
        background-color: #d6dbdf !important;
        color: #99a3a4 !important;
        cursor: none;
        opacity: 0.6;
        box-shadow: none !important;
      }`
    ]
})
export class ConsumerAddEditComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(ProfileUploadComponent) profileUploadComponent!: ProfileUploadComponent;

  consumerForm!: FormGroup;
  editMode = false;
  consumerId?: number;
  userCompanyId?: number;
 

  constructor(
    private fb: FormBuilder,
    private service: ConsumerService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBarService: SnackBarService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadConsumerIfEditMode();
  }

  /**
   * Initializes the consumer form with validators
   */
  private initializeForm(): void {
    this.consumerForm = createConsumerForm(this.fb);
    // this.fb.group({
    //   role: ['Consumer', Validators.required],
    //   firstName: ['', [Validators.required,Validators.pattern("^[A-Za-z]+( [A-Za-z]+)*$")]],
    //   lastName: ['', [Validators.required,Validators.pattern("^[A-Za-z]+( [A-Za-z]+)*$")]],
    //   phone: ['', [Validators.required,Validators.pattern('^\\(\\d{3}\\) \\d{3}-\\d{4}$')]],
    //   email: [
    //     '',
    //     [
    //       Validators.required,
    //       Validators.email,
    //       Validators.pattern(
    //         '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'
    //       ),
    //     ],
    //   ],
    //   profileImage: [null],
    // });
  }

  /**
   * Loads consumer data if in edit mode
   */
  private loadConsumerIfEditMode(): void {
    this.route.queryParams.pipe(first()).subscribe(params => {
      this.consumerId = +params['id'];
      if (!this.consumerId) return;

      this.editMode = true;
      this.service.getConsumerById(this.consumerId).pipe(first()).subscribe({
        next: (consumer) => {
          if (!consumer) {
            this.snackBarService.showError('Consumer not found');
            this.router.navigate(['/apps/consumer']);
            return;
          }
          console.log('[DEBUG] Consumer data:', consumer); // Debug log
          this.userCompanyId = consumer.userCompanyId.id;
          this.consumerForm.patchValue({
            role: consumer.role ?? 'Consumer',
            firstName: consumer.firstName ?? '',
            lastName: consumer.lastName ?? '',
            phone: consumer.phoneNumber ?? '',
            email: consumer.email ?? '',
          });
        },
        error: (error: any) => {
          console.error('[DEBUG] Error fetching consumer:', error); // Debug log
          this.snackBarService.showError(error.error?.message ?? 'Error loading consumer');
          this.router.navigate(['/apps/consumer']);
        }
      });
    });
  }


  /**
   * Submits the form to save or update consumer
   */
  async onSubmit(): Promise<void> {
    if (this.consumerForm.invalid) {
      this.consumerForm.markAllAsTouched();
      this.snackBarService.showError('Please correct form errors');
      return;
    }

    const payload = this.buildPayload();
    try {
      if (this.editMode) {
        await this.service.updateConsumer(payload).toPromise();
        this.snackBarService.showSuccess('Consumer updated successfully');
      } else {
        await this.service.saveConsumer(payload).toPromise();
        this.snackBarService.showSuccess('Consumer added successfully');
      }
      this.router.navigate(['/apps/consumer']);
    } catch (err: unknown) {
      
    }
  }

  /**
   * Builds the API payload from form data
   */
  private buildPayload(): any {
    const { firstName, lastName, email, phone, role } = this.consumerForm.value;
    const payload: any = {
      firstName: firstName,
      lastName: lastName,
      email,
      phoneNumber: phone,
      roleId: { id: role === 'Consumer' ? 2 : 1 },
      deleted: false,
      isActive: true,
    };

    if (this.editMode) {
      payload.loginUserId = this.consumerId;
      payload.userCompanyId = { id: this.userCompanyId };
    }
    return payload;
  }

  /**
   * Navigates back to consumer list
   */
  navigateToConsumerList(): void {
    this.router.navigate(['/apps/consumer']);
  }


}