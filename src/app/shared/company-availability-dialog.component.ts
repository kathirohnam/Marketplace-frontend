import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: "dialog-overview",
    imports: [
        MatDialogActions,
        MatDialogClose,
        MatDialogTitle,
        MatDialogContent,
        MatButtonModule,
        CommonModule,
    ],
    template: `
    <div
      class="d-flex flex-column align-items-center justify-content-center text-center p-4"
      [ngClass]="{
        'success-dialog': data.isSuccess,
        'error-dialog': !data.isSuccess
      }"
    >
      <h3 mat-dialog-title class="mat-subtitle-1">{{ data.title }}</h3>
      <p mat-dialog-content class="mat-subtitle-2 lh-16 mb-3">
        {{ data.message }}
    </p>
      <div mat-dialog-actions class="w-100 d-flex justify-content-center">
        <button
          mat-flat-button
          class="button-allset"
          mat-dialog-close
          cdkFocusInitial
          (click)="saveAndClose()"
        >
          Ok
        </button>
      </div>
    </div>
  `,
    styles: [
        `
      .success-dialog {
        background-color: #f5faf5;
      }
      .error-dialog {
        background-color: #ffffffff;
      }
    `,
    ]
})
export class CompanyAvailabilityDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CompanyAvailabilityDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      isSuccess: boolean;
      saveStateAndCompanyName?: () => void;
    }
  ) {}

  saveAndClose() {
    if (this.data.isSuccess && this.data.saveStateAndCompanyName) {
      this.data.saveStateAndCompanyName();
    }
    this.dialogRef.close(this.data.isSuccess);
  }
}