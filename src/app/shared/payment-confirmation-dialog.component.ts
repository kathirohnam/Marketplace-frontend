import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MaterialModule } from '../material.module';

@Component({
    selector: 'app-payment-confirmation-dialog',
    imports: [
        MaterialModule,
        CommonModule,
    ],
    template: `
    <div class="dialog-box">
      <div class="dialog-content">
        <ng-container *ngIf="data.isSuccessful; else failureContent">
          <div class="checkmark-container success">
            <div class="checkmark tick"></div>
          </div>
          <h2>Payment Successful 🎉</h2>
          <p>
            Congratulations! Your payment for <strong>LLC</strong> was processed
            successfully.
          </p>
          <p class="footer-note">
            📬 You’ll receive email updates as we move forward. Sit back, relax
            — we’ve got this!
          </p>
          <button (click)="closeDialog()">Next</button>
        </ng-container>

        <ng-template #failureContent>
          <div class="checkmark-container failure">
            <div class="checkmark x-mark"></div>
          </div>
          <h2>Payment Failed</h2>
          <p>Oops! Something went wrong with your payment</p>
          <p class="footer-note">No worries — please try again!</p>
          <button class="danger-button" (click)="failureDialog()">
            Try Again
          </button>
        </ng-template>
      </div>
    </div>
  `,
    styles: [
        `
      .dialog-box {
        position: fixed;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
      }

      .dialog-content {
        background-color: #fff;
        padding: 20px;
        border-radius: 30px;
        width: 400px;
        text-align: center;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
      }

      .checkmark-container {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin: 0 auto 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
      }

      .checkmark-container.success {
        background-color: #28a745;
      }

      .checkmark-container.failure {
        background-color: #dc3545;
      }

      .checkmark {
        width: 30px;
        height: 30px;
        background-color: white;
      }

      .tick {
        clip-path: polygon(
          0% 55%,
          10% 45%,
          40% 75%,
          90% 20%,
          100% 30%,
          40% 90%
        );
      }

      .x-mark {
        clip-path: polygon(
          0% 10%,
          10% 0%,
          50% 40%,
          90% 0%,
          100% 10%,
          60% 50%,
          100% 90%,
          90% 100%,
          50% 60%,
          10% 100%,
          0% 90%,
          40% 50%
        );
      }

      h2 {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
      }

      p {
        font-size: 15px;
        color: #555;
        margin: 0 0 10px;
      }

      .footer-note {
        font-size: 12px;
        color: #666;
      }

      button {
        padding: 10px 20px;
        border: none;
        border-radius: 30px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 10px;
        color: white;
        background-color: #28a745;
      }

      button:hover {
        background-color: #218838;
      }

      .danger-button {
        background-color: #dc3545;
      }

      .danger-button:hover {
        background-color: #c82333;
      }
    `,
    ]
})
export class PaymentConfirmationDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { isSuccessful: boolean },
    public dialogRef: MatDialogRef<PaymentConfirmationDialogComponent>,
    private router: Router
  ) {}

  closeDialog() {
    this.dialogRef.close(true);
  }

  failureDialog() {
    this.dialogRef.close(false);
    this.router.navigate(['/apps/dashboard']);
  }
}