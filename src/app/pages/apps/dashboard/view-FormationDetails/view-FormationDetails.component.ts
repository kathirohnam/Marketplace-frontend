import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyDetails } from 'src/app/models/dashboard';

@Component({
    selector: 'app-view-details-dialog',
    templateUrl: './view-FormationDetails.component.html',
    styleUrls: ['./view-FormationDetails.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        // MatDialogActions,
        // MatDialogClose,
        // MatDialogContent,
        // MatDialogTitle,
        MatButtonModule,
        MatStepperModule,
    ]
})
export class FormationDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<FormationDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public companyDetails: CompanyDetails
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}