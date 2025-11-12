import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { MatStepper, MatStepperModule } from "@angular/material/stepper";
import { StepperSelectionEvent } from "@angular/cdk/stepper";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MaterialModule } from "src/app/material.module";
import { NgIcon } from "@ng-icons/core";
import { FilerService } from "src/app/services/apps/filer/filer.service";
import { NgxMaskDirective, NgxMaskPipe } from "ngx-mask";
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { HttpErrorResponse } from "@angular/common/http";
import { ErrorStateMatcher } from "@angular/material/core";
import { FormControl, FormGroupDirective, NgForm } from "@angular/forms";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { SnackBarService } from "src/app/shared/snackbar.service";

interface FileWithPreview extends File {
  preview?: string;
  isValid?: boolean;
}

export class TouchedOnlyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}

@Component({
  selector: "app-filer-wizard",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    NgIcon,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    NgxExtendedPdfViewerModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
  ],
  templateUrl: "./filer-wizard.component.html",
  styleUrls: ["./filer-wizard.component.scss"],
  providers: [
    { provide: ErrorStateMatcher, useClass: TouchedOnlyErrorStateMatcher },
  ],
})
export class FilerWizardComponent implements OnInit {
  @ViewChild("stepper") stepper!: MatStepper;
  filingForm!: FormGroup;
  failureForm!: FormGroup;
  data: any;
  companyId: number | null = null;
  isEditing: { [key: string]: boolean } = {};
  hasChanges = false;
  changeNotes = "";
  managementstyle: string | null = null;

  notesEnabled = false;
  initialStep = 0;
  errorStateMatcher = new TouchedOnlyErrorStateMatcher();

  // Updated file handling properties
  selectedFile: FileWithPreview | null = null;
  uploadProgress = 0;
  uploadError = "";

  // File validation constants
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_FILE_TYPES = ["application/pdf"];
  private readonly ALLOWED_EXTENSIONS = [".pdf"];

  documentTypes: any[] = [];
  isNextEnabled = false;
  fileUploaded = false;
  failureCategories: any[] = [];
  today: Date = new Date();
  blob: Blob;
  documentUrl = "";
  private blobUrl?: string;
  private readonly loginUserId: number =
    Number(localStorage.getItem("login_user_id")) || 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fillerService: FilerService,
    private fb: FormBuilder,
    private snackBarService: SnackBarService
  ) {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.filingForm = this.fb.group({
      filingDate: [null, Validators.required],
      paymentAmount: [null, Validators.required],
      transactionCode: [
        "",
        [Validators.required, Validators.pattern("^[A-Z0-9]{6,12}$")],
      ],
      paymentMethod: [null, Validators.required],
      payerName: [
        "",
        [
          Validators.required,
          Validators.pattern("^[a-zA-Z ]+$"),
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
    });

    this.failureForm = this.fb.group({
      failureCategory: ["", Validators.required],
      failureDescription: ["", Validators.required],
      nextSteps: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.companyId = Number(qp.get("companyId"));
    this.initialStep = Number(qp.get("step")) || 0;

    if (this.companyId) {
      this.fillerService
        .getUserProgressByCompanyId(this.companyId)
        .subscribe((progress) => {
          this.data = progress;
          this.managementstyle = this.data?.managementStyle;
          this.fillerService.setCurrentProgress(progress);

          // Move getFile logic here - only triggers after managementstyle is set!
          if (
            (this.initialStep === 3 && this.managementstyle === "member") ||
            (this.initialStep === 4 && this.managementstyle === "manager")
          ) {
            this.fillerService
              .getFile(
                this.companyId!,
                "Articles of Organization",
                "view",
                "filling",
                this.loginUserId
              )
              .subscribe({
                next: (blob) => {
                  this.blob = blob;
                  if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
                  this.blobUrl = URL.createObjectURL(blob);
                  this.documentUrl = this.blobUrl;
                },
              });
          }
        });
    }

    this.fillerService.currentProgress$.subscribe((progress) => {
      if (progress?.companyId === this.companyId) {
        this.data = progress;
      }
    });

    this.fillerService.getFailureCategories().subscribe({
      next: (response: any[]) => {
        this.failureCategories = response.filter((c) => c.isActive);
        console.log("Loaded failureCategories:", this.failureCategories);
      },
      error: (err) => console.error("Could not load failure categories", err),
    });

    this.fetchDocumentTypes();
  }

  fetchDocumentTypes(): void {
    console.log("Fetching document types...");
    this.fillerService.getDocumentTypes().subscribe({
      next: (data: any[]) => {
        this.documentTypes = data.filter((item) => item.documentTypeId === 2);
      },
      error: (err) => {
        console.error("Failed to load document types", err);
      },
    });
  }

  onStepChange(event: StepperSelectionEvent): void {
    this.isEditing = {};
    this.updateStepInUrl(event.selectedIndex);
  }

  private updateStepInUrl(stepIndex: number): void {
    if (this.companyId) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          companyId: this.companyId,
          step: stepIndex,
        },
        queryParamsHandling: "merge",
        replaceUrl: true,
      });
    }
  }

  public moveToNextStep(): void {
    if (this.stepper.selectedIndex < this.stepper.steps.length - 1) {
      this.stepper.next();
      this.updateStepInUrl(this.stepper.selectedIndex);
    }
  }

  public moveToPreviousStep(): void {
    if (this.stepper.selectedIndex > 0) {
      this.stepper.previous();
      this.updateStepInUrl(this.stepper.selectedIndex);
    }
  }

  toggleSectionEdit(sectionKey: string): void {
    this.isEditing[sectionKey] = !this.isEditing[sectionKey];
  }

  onFieldChange(): void {
    this.hasChanges = true;
    this.notesEnabled = true;
  }

  // Enhanced file handling methods
  onFilesSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
    // Reset the input value to allow re-selecting the same file
    event.target.value = "";
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private processFile(file: File): void {
    this.uploadError = "";

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      this.uploadError = validation.error!;
      return;
    }

    // Sanitize file
    const sanitizedFile = this.sanitizeFile(file);
    if (!sanitizedFile) {
      this.uploadError = "File failed security validation";
      return;
    }

    this.selectedFile = sanitizedFile;
    this.fileUploaded = true;
    this.snackBarService.showSuccess("PDF file selected successfully", "Close");
  }

  private validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return { isValid: false, error: "Only PDF files are allowed" };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = this.ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    if (!hasValidExtension) {
      return { isValid: false, error: "File must have a .pdf extension" };
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      const maxSizeMB = this.MAX_FILE_SIZE / (1024 * 1024);
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeMB}MB`,
      };
    }

    // Check for empty file
    if (file.size === 0) {
      return { isValid: false, error: "File cannot be empty" };
    }

    return { isValid: true };
  }

  private sanitizeFile(file: File): FileWithPreview | null {
    try {
      // Create a new file object to avoid potential script injection
      const sanitizedName = this.sanitizeFileName(file.name);

      // Create a new File object with sanitized properties
      const sanitizedFile = new File([file], sanitizedName, {
        type: "application/pdf",
        lastModified: Date.now(),
      }) as FileWithPreview;

      sanitizedFile.isValid = true;
      return sanitizedFile;
    } catch (error) {
      console.error("File sanitization failed:", error);
      return null;
    }
  }

  private sanitizeFileName(fileName: string): string {
    // Remove potentially dangerous characters and limit length
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars with underscore
      .substring(0, 100) // Limit filename length
      .replace(/_{2,}/g, "_") // Replace multiple underscores with single
      .trim();
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileUploaded = false;
    this.uploadProgress = 0;
    this.uploadError = "";
    this.snackBarService.show("File removed", "Close");
  }

  previewFile(): void {
    if (this.selectedFile) {
      const url = URL.createObjectURL(this.selectedFile);
      window.open(url, "_blank");
      // Clean up URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  uploadDocuments(): void {
    if (!this.selectedFile || !this.companyId || !this.data.documentType) {
      this.snackBarService.show(
        "Please select a PDF file and document type",
        "Close"
      );
      return;
    }

    const documentType = this.data.documentType;
    this.uploadProgress = 0;

    console.log("Uploading document with type:", documentType);

    this.fillerService
      .uploadDocument(
        this.companyId,
        documentType,
        this.selectedFile,
        "notify_success",
        this.loginUserId
      )
      .subscribe({
        next: (response) => {
          this.uploadProgress = 100;
          console.log("Document uploaded successfully:", response);
          this.snackBarService.showSuccess(
            response || "Document uploaded successfully",
            "Close"
          );
          this.closeWizard();
        },
        error: (error) => {
          this.uploadProgress = 0;
          this.uploadError = "Upload failed. Please try again.";
          console.error("Upload error:", error);
        },
      });
  }

  // Rest of your existing methods remain the same...
  saveAndContinue(): void {
    if (this.companyId == null) {
      return;
    }

    if (!this.changeNotes || !this.changeNotes.trim()) {
      this.snackBarService.show(
        "Please enter change notes before saving",
        "Close"
      );
      return;
    }
    const notes = this.changeNotes;

    if (!this.loginUserId) {
      this.snackBarService.show(
        "Unable to determine current user—please log in again.",
        "Close"
      );
      return;
    }

    this.fillerService
      .updateCompanyData(
        this.companyId,
        this.data,
        this.isEditing,
        notes,
        +this.loginUserId
      )
      .subscribe({
        next: (response) => {
          console.log("Backend Response:", response);
          this.hasChanges = false;
          this.isEditing = {};
          this.changeNotes = "";
          this.notesEnabled = false;
          this.snackBarService.showSuccess(
            response || "Data saved successfully",
            "Close"
          );

          if (
            (this.stepper.selectedIndex === 2 && this.data.step13b?.length) ||
            (this.stepper.selectedIndex === 3 && this.data.step13a?.length)
          ) {
            setTimeout(() => this.fetchAndPreview(), 50);
          } else {
            if (this.stepper.selectedIndex < this.stepper.steps.length - 1) {
              this.moveToNextStep();
            } else {
              this.closeWizard();
            }
          }
        },
      });
  }

  closeWizard(): void {
    this.router.navigate(["/apps/Files"]);
  }

  isPreviewStep(index: number): boolean {
    if (!this.data) return false;

    let expected = 1;

    if (this.data.step13a?.length) expected++;
    if (this.data.step13b?.length) expected++;

    expected++;

    if (index === 4 || index === 5 || index === 6) {
      return true;
    }

    return index === expected;
  }

  fetchAndPreview(): void {
    if (!this.companyId) return;

    this.fillerService
      .generateDocument(this.companyId, this.data.step1, this.loginUserId)
      .subscribe({
        next: () => {
          this.fillerService
            .getFile(
              this.companyId!,
              "Articles of Organization",
              "view",
              "filling",
              this.loginUserId
            )
            .subscribe({
              next: (blob) => {
                this.blob = blob;
                if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
                this.blobUrl = URL.createObjectURL(blob);
                this.documentUrl = this.blobUrl;
                this.moveToNextStep();
                this.snackBarService.showSuccess(
                  "PDF preview loaded successfully",
                  "Close"
                );
              },
            });
        },
      });
  }

  downloadDocument(): void {
    if (!this.companyId || !this.data || !this.blob) return;

    const companyName = this.data.step2?.companyName
      ? this.data.step2.companyName.replace(/\s+/g, "_")
      : `Company_${this.companyId}`;

    this.fillerService
      .getFile(
        this.companyId,
        "Articles of Organization",
        "download",
        "filling",
        this.loginUserId
      )
      .subscribe({
        next: (response: any) => {
          const companyName = this.data.step2?.companyName
            ? this.data.step2.companyName.replace(/\s+/g, "_")
            : `Company_${this.companyId}`;

          const url = URL.createObjectURL(this.blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${companyName}_Articles of Organization.pdf`;
          link.click();
          URL.revokeObjectURL(url);
          this.closeWizard();
          this.snackBarService.showSuccess(
            "Document downloaded successfully",
            "Close"
          );
        },
      });
  }

  printDocument(): void {
    if (this.blobUrl) {
      const win = window.open(this.blobUrl, "_blank");
      win?.focus();
      win?.print();
      this.snackBarService.show("Document opened for printing", "Close");
    } else {
      this.snackBarService.show("No document available to print", "Close");
    }
  }

  public shouldEnableChangeNotes(): boolean {
    return this.notesEnabled;
  }

  onStatusChange(event: any) {
    console.log("Filing status updated to:", event.value);
  }

  submitCompanyFiling(): void {
    if (!this.companyId || this.filingForm.invalid) {
      this.filingForm.markAllAsTouched();
      this.snackBarService.show("Please complete all required fields", "Close");
      return;
    }

    const {
      filingDate,
      paymentAmount,
      transactionCode,
      paymentMethod,
      payerName,
    } = this.filingForm.value;
    const payload = {
      filer: { loginUserId: this.loginUserId },
      company: { companyId: this.companyId },
      filingDate: this.formatDate(filingDate),
      paymentAmount,
      transactionCode,
      paymentMethod,
      payerName,
      isActive: true,
    };

    console.log("Submitting company filing payload:", payload);

    this.fillerService.createCompanyFiling(payload).subscribe({
      next: () => {
        console.log("Successfully saved filing for companyId=", this.companyId);
        this.snackBarService.showSuccess(
          "Filing submitted successfully",
          "Close"
        );
        this.closeWizard();
      },
    });
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const D = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${D}`;
  }

  saveFailureReport(): void {
    if (!this.companyId || this.failureForm.invalid) {
      this.failureForm.markAllAsTouched();
      this.snackBarService.show("Please fill out all failure fields", "Close");
      return;
    }

    const { failureCategory, failureDescription, nextSteps } =
      this.failureForm.value;

    const payload = {
      filingFailureCategory: {
        filingFailureCategoryId: failureCategory,
      },
      failureDescription,
      nextSteps,
    };

    console.log("Posting failure report payload:", payload);

    this.fillerService
      .createFilingFailure(this.companyId, this.loginUserId, payload)
      .subscribe({
        next: () => {
          this.snackBarService.showSuccess(
            "Filing failure report saved successfully",
            "Close"
          );
          this.closeWizard();
        },
      });
  }
}
