import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'app-business-name-check-dialog',
    imports: [],
    templateUrl: './business-name-check-dialog.component.html',
    styleUrl: './business-name-check-dialog.component.scss',
    animations: [
        trigger('fadeSlideIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' })),
            ]),
        ]),
    ],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class BusinessNameCheckDialogComponent {
  firstPart!: number;
  secondPart!: number;

  constructor(
    public dialogRef: MatDialogRef<BusinessNameCheckDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      name: string;
      state: string;
      entity: string;
      saveStateAndCompanyName?: () => void;
    }
  ) { this.setYearParts();}

  onClose() {
    this.dialogRef.close('back');
  }

  onNext() {
    if (this.data.saveStateAndCompanyName) {
      this.data.saveStateAndCompanyName();
    }
    // Close the dialog and pass back an instruction object
    this.dialogRef.close({ proceed: true, focusTarget: 'formationDateInput' });
  }
  setYearParts(): void {
    const year = new Date().getFullYear(); 
    const yearStr = year.toString(); 
    this.firstPart = +yearStr.slice(0, 2); 
    this.secondPart = +yearStr.slice(2); 
  }
}
