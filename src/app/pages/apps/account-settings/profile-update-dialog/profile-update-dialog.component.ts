import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-profile-update-dialog',
  templateUrl: './profile-update-dialog.component.html',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, NgIcon],
})
export class ProfileUpdateDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ProfileUpdateDialogComponent>,
    private router: Router
  ) {}

  navigateToProfile(): void {
    // Navigate to your account settings or profile page
    this.router.navigate(['/apps/account-settings']);
    this.dialogRef.close();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}