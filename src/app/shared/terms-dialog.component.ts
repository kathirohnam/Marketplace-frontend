import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MaterialModule } from 'src/app/material.module';

@Component({
    selector: "app-terms-dialog",
    imports: [CommonModule, MatDialogModule, MatButtonModule, MaterialModule],
    template: `
    <div
      class="dialog-title-container"
      style="display: flex; align-items: center; justify-content: space-between;"
    >
      <h2 mat-dialog-title class="fw-bold text-center mb-2" style="flex: 1;">
        Terms & Conditions
      </h2>
      <button
        mat-icon-button
        (click)="closeDialog()"
        style="margin-left: 8px; margin-right: 5px;"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content
      class="scroll-container px-2"
      #scrollContent
      (scroll)="onScroll(scrollContent)"
    >
      <div class="content" [innerHTML]="termsText"></div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="mt-3">
      <button
        mat-flat-button
        [disabled]="!scrolledToBottom"
        (click)="confirm()"
        class="button-all"
      >
        Agree & Submit
      </button>
    </mat-dialog-actions>
  `,
    styles: [
        `
      .scroll-container {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #ccc;
        border-radius: 8px;
      }
      .content {
        padding: 10px;
        font-size: 14px;
        color: #333;
      }
      .content p {
        margin-bottom: 10px;
        line-height: 1.5;
      }
      .content strong {
        display: block;
        font-weight: 600;
      }
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
export class TermsDialogComponent implements OnInit {
  scrolledToBottom = false;
  termsText = "Loading terms…";

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {  formType: "regForm1" | "regForm3" | "regForm4"; termsText: string },
    private dialogRef: MatDialogRef<TermsDialogComponent>
  ) {}

  ngOnInit(): void {
    this.termsText = this.formatTerms(this.data.termsText || "");
  }

  onScroll(el: HTMLElement): void {
    this.scrolledToBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
  closeDialog(): void {
    this.dialogRef.close(false); // return false when user cancels
  }

  private formatTerms(raw: string): string {
    const lines = raw.split(/(?=\d+\.\s)/g); // Split at numbered sections like 1. , 2. , etc.

    const formatted = lines
      .map((line) => {
        // Match: starts with number (e.g., "1. "), followed by any characters (non-greedy), then a colon
        const match = line.match(/^(\d+\.\s.*?:)(\s*)([\s\S]*)$/);

        if (!match) return `<p>${line.trim()}</p>`;

        const heading = match[1].trim(); // From number to first colon
        const space = match[2] || " ";
        const body = match[3].trim(); // Rest of the text

        return `<p><strong>${heading}</strong>${space}${body}</p>`;
      })
      .join("");

    return formatted;
  }
}