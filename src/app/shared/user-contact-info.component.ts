// src/app/shared/user-contact-info/user-contact-info.component.ts
import { Component, Input } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { NgxMaskDirective, NgxMaskPipe } from "ngx-mask";
import { CommonModule } from "@angular/common";


@Component({
    selector: "app-user-contact-info",
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        NgxMaskDirective,
       
    ],
    template: `
    <div [formGroup]="formGroup">
      <!-- First & Last Name -->
      <div class="row">
        <div class="col">
          <mat-form-field appearance="outline" class="w-100 mb-4">
            <mat-label>First Name</mat-label>
            <input
              matInput
              formControlName="firstName"
              placeholder="Enter first name"
              required
            />
            <mat-error *ngIf="formGroup.get('firstName')?.hasError('required')">
              First name is required
            </mat-error>
            <mat-error
              *ngIf="
                formGroup.get('firstName')?.hasError('pattern') &&
                !formGroup.get('firstName')?.hasError('required')
              "
            >
              Use only letters
            </mat-error>
             <mat-error
                          *ngIf="
                            formGroup.get('firstName')?.hasError('maxlength')
                          "
                        >
                          Max 60 characters allowed
                        </mat-error>
          </mat-form-field>
        </div>

        <div class="col">
          <mat-form-field appearance="outline" class="w-100 mb-4">
            <mat-label>Last Name</mat-label>
            <input
              matInput
              formControlName="lastName"
              placeholder="Enter last name"
              required
            />
            <mat-error *ngIf="formGroup.get('lastName')?.hasError('required')">
              Last name is required
            </mat-error>
            <mat-error
              *ngIf="
                formGroup.get('lastName')?.hasError('pattern') &&
                !formGroup.get('lastName')?.hasError('required')
              "
            >
              Use only letters
            </mat-error>
             <mat-error
                          *ngIf="
                            formGroup.get('lastName')?.hasError('maxlength')
                          "
                        >
                          Max 60 characters allowed
                        </mat-error>
          </mat-form-field>
        </div>
      </div>

      <!-- Contact Number & Email -->
      <div class="row">
        <div class="col">
          <mat-form-field appearance="outline" class="w-100 mb-4">
            <mat-label>Contact Number</mat-label>
            <input
              matInput
              type="text"
              formControlName="phone"
              placeholder="(123) 456-7890"
              mask="(000) 000-0000"
              [dropSpecialCharacters]="false"
              required
            />
            <mat-error *ngIf="formGroup.get('phone')?.hasError('required')">
              Contact number is required
            </mat-error>
            <mat-error *ngIf="formGroup.get('phone')?.hasError('pattern')">
              Use format (123) 456-7890
            </mat-error>
          </mat-form-field>
        </div>

        <div class="col">
          <mat-form-field appearance="outline" class="w-100 mb-4">
            <mat-label>Email</mat-label>
            <input
              matInput
              formControlName="email"
              placeholder="Enter email address"
              required
              type="email"
            />
            <mat-error *ngIf="formGroup.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error
              *ngIf="
                formGroup.get('email')?.hasError('pattern') &&
                !formGroup.get('email')?.hasError('required')
              "
            >
              Please enter a valid email address
            </mat-error>
          </mat-form-field>
        </div>
      </div>
    </div>
  `
})
export class UserContactInfoComponent {
  @Input() formGroup!: FormGroup;
}
