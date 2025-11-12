import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatTabsModule } from "@angular/material/tabs";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { AccountSettingService } from "src/app/services/apps/account-settings/account-settings.service";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { Subject, filter, takeUntil } from "rxjs";
import { CommonModule, Location } from "@angular/common";
import { LoadingService } from "src/app/services/loading/loading.service";
import { UserService } from "src/app/shared/userService";
import {
  ImageEditorComponent,
  ImageEditResult,
} from "./image-editor.component";
import { TokenService } from "src/app/services/token/token.service";
import { NgxMaskDirective } from "ngx-mask";
import { createAccountSettingsForm } from "src/app/models/account-settings";

@Component({
  selector: "app-account-setting",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    NgxMaskDirective,
  ],
  templateUrl: "./account-setting.component.html",
  styleUrls: ["./account-setting.component.scss"],
})
export class AppAccountSettingComponent implements OnInit {
  @ViewChild("fileInputRef") fileInputRef!: ElementRef<HTMLInputElement>;
  profileForm!: FormGroup;
  userId = localStorage.getItem("login_user_id");
  private destroy$ = new Subject<void>();

  // Profile Image Properties
  profileImageUrl: string | undefined = "";
  defaultProfileImage: string = "/assets/avatar-0.jpg";
  selectedFile: File | null = null;
  uploadError: string = "";
  showEditOverlay: boolean = false;

  // File upload constraints
  maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
  allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountSettingService: AccountSettingService,
    private snackBarService: SnackBarService,
    private location: Location,
    private loadingService: LoadingService,
    private userService: UserService,
    private dialog: MatDialog,
    private tokenservice: TokenService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProfile();
    this.subscribeToUserChanges();
  }

  private initializeForm(): void {
    const initial = this.userService.getUserSnapshot() || {};
    this.profileForm = createAccountSettingsForm(this.fb, initial);
  }

  private subscribeToUserChanges(): void {
    this.userService.user$
      .pipe(
        filter((user) => !!user),
        takeUntil(this.destroy$)
      )
      .subscribe((user) => {
        if (user) {
          this.profileForm.patchValue(user);
          this.profileImageUrl = user.profileImageUrl || "";
        }
      });
  }

  loadProfile(): void {
    const userData = this.userService.getUserSnapshot();
    if (userData) {
      this.profileForm.patchValue(userData);
      this.profileImageUrl = userData.profileImageUrl || "";
      this.profileForm.patchValue({ profileImage: this.profileImageUrl });
    }
  }

  // Triggers the hidden file input
  uploadImage(): void {
    this.uploadError = '';
    this.fileInputRef?.nativeElement.click();
  }

  // Handles file selection for immediate preview, without opening the editor
  onFilePicked(event: Event): void {
    this.uploadError = '';
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file type and size
    if (!this.allowedFileTypes.includes(file.type)) {
      this.uploadError = "Only JPG and PNG files are allowed.";
      input.value = "";
      return;
    }
    if (file.size > this.maxFileSize) {
      this.uploadError = "File too large. Max size is 5MB.";
      input.value = "";
      return;
    }

    this.selectedFile = file;

    // Read the file and display it as a preview
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImageUrl = reader.result as string;
      this.profileForm.patchValue({ profileImage: this.profileImageUrl });
    };
    reader.onerror = () => {
      this.uploadError = "Could not read the file. Please try another image.";
    };
    reader.readAsDataURL(file);
  }

  // Opens the editor only when an existing image is clicked
  onEditClick(): void {
    if (!this.profileImageUrl) {
      this.snackBarService.showError("Please upload an image first to edit it.", "Close");
      return;
    }

    const dialogRef = this.dialog.open(ImageEditorComponent, {
      data: { imageUrl: this.profileImageUrl },
      width: 'clamp(600px, 85vw, 950px)',
      height: 'clamp(450px, 85vh, 700px)',
      panelClass: "image-editor-dialog-container",
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result: ImageEditResult | undefined) => {
      if (result?.editedImageUrl) {
        this.profileImageUrl = result.editedImageUrl;
        this.selectedFile = null; // Original file is no longer needed after editing
        this.profileForm.patchValue({ profileImage: this.profileImageUrl });
        this.snackBarService.showSuccess("Profile image updated.", "Close");
      }
    });
  }

  resetProfileImage(): void {
    this.uploadError = '';
    this.selectedFile = null;
    this.profileImageUrl = '';
    this.profileForm.patchValue({ profileImage: '' });
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  onImageError(): void {
    this.profileImageUrl = '';
  }

  saveProfile(): void {
    if (this.uploadError) {
      this.snackBarService.showError("Please fix the image upload error before saving.", "Close");
      return;
    }
    if (!this.profileForm.valid) {
      this.snackBarService.showError("Please fill in all required fields correctly.", "Close");
      return;
    }

    this.loadingService.show("Updating profile…");

    const userDetails = {
      loginUserId: Number(this.userId),
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      email: this.profileForm.value.email,
      phoneNumber: this.profileForm.value.phoneNumber,
      profileImageUrl: this.profileImageUrl,
    };

    this.accountSettingService.updateprofile(userDetails).subscribe({
      next: (response) => {
        this.userService.updateUser(userDetails);
        this.loadingService.hide();
        this.snackBarService.showSuccess("Profile updated successfully", "Close");
        this.saveback();
      },
      error: (error) => {
        this.loadingService.hide();
        this.snackBarService.showError("Failed to update profile. Please try again.", "Close");
        console.error("Profile update error:", error);
      },
    });
  }

  saveback(): void {
    const companyCount = Number(sessionStorage.getItem("companyCount"));
    if (companyCount === 0 && this.tokenservice.getRole() === "Consumer") {
      this.router.navigate(["/wizard/forms"]);
    } else {
      this.location.back();
    }
  }

  isCancelVisible(): boolean {
    const companyCount = Number(sessionStorage.getItem("companyCount"));
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
    const firstMissing = !userData?.firstName;
    const lastMissing = !userData?.lastName;

    return !(firstMissing && lastMissing && companyCount === 0 && this.tokenservice.getRole() === "Consumer");
  }

  back(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

