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
import { FilerService } from "src/app/services/apps/filer/filer.service";
import { NgxMaskDirective, NgxMaskPipe } from "ngx-mask";
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { HttpErrorResponse } from "@angular/common/http";
import { ErrorStateMatcher } from "@angular/material/core";
import {
  FormArray,
  FormControl,
  FormGroupDirective,
  NgForm,
} from "@angular/forms";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { LottieComponent, AnimationOptions } from "ngx-lottie";
import { LoadingService } from "src/app/services/loading/loading.service";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { CompanyFormationService } from "src/app/services/apps/formation-wizard/formation-wizard.service";
import {
  createBusinessAddressForm,
  createFailureForm,
  createFilingForm,
  createManagerForm,
  createMembersForm,
  createPersonGroup,
  createPrimaryContactForm,
  createRegisteredAgentForm,
} from "src/app/models/filer";

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
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    NgxExtendedPdfViewerModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    // NgxMaskPipe,
    LottieComponent,
    MatSlideToggleModule,
  ],
  templateUrl: "./filer-wizard.component.html",
  styleUrls: ["./filer-wizard.component.scss"],
  providers: [
    { provide: ErrorStateMatcher, useClass: TouchedOnlyErrorStateMatcher },
  ],
})
export class FilerWizardComponent implements OnInit {
  @ViewChild("stepper") stepper!: MatStepper;

  // Existing forms
  filingForm!: FormGroup;
  failureForm!: FormGroup;
  managementForm: FormGroup;

  // ✅ NEW: Validation sub-forms (reactive) for each section (no HTML changes)
  primaryContactForm!: FormGroup;
  managersForm!: FormArray;
  membersForm!: FormArray;
  businessAddressForm!: FormGroup;
  registeredAgentForm!: FormGroup;

  // Patterns (exactly as requested)
  // private readonly NAME_RE = /^[A-Za-z]+( [A-Za-z]+)*$/;
  // private readonly EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  // private readonly PHONE_RE = /^\(\d{3}\) \d{3}-\d{4}$/;
  // private readonly CITY_RE = /^(?!\s*$)[A-Za-z ]+$/;
  // private readonly ZIP_RE = /^[0-9]{5}$/;

  data: any;
  companyId: number | null = null;
  isEditing: { [key: string]: boolean } = {};
  hasChanges = false;
  changeNotes = "";
  managementstyle: string | null = null;
  confirmationChecked = false;

  raToggleLoading = false;
  notesEnabled = false;
  initialStep = 0;
  errorStateMatcher = new TouchedOnlyErrorStateMatcher();
  isRAToggled: boolean = false;

  // Updated file handling properties
  selectedFile: FileWithPreview | null = null;
  uploadProgress = 0;
  uploadError = "";
  private printBlockListener: any;

  // File validation constants
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_FILE_TYPES = ["application/pdf"];
  private readonly ALLOWED_EXTENSIONS = [".pdf"];
  loading = true; // Flag to show loading state
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

  lottieOptions: AnimationOptions = {
    path: "assets/animations/filesLoading.json",
    loop: true,
    autoplay: true,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fillerService: FilerService,
    private fb: FormBuilder,
    private snackBarService: SnackBarService,

    private loadingService: LoadingService,
    private formationService: CompanyFormationService
  ) {}

  private initializeForms(): void {
    // Existing forms (unchanged)
    this.filingForm = createFilingForm(this.fb);

    // this.fb.group({
    //   filingDate: [null, Validators.required],
    //   paymentAmount: [null, Validators.required],
    //   transactionCode: [
    //     "",
    //     [
    //       Validators.required,
    //       Validators.pattern("^[A-Za-z0-9][A-Za-z0-9._-]{6,28}[A-Za-z0-9]$"),
    //     ],
    //   ],
    //   paymentMethod: [null, Validators.required],
    //   payerName: [
    //     "",
    //     [
    //       Validators.required,
    //       Validators.pattern("^[a-zA-Z ]+$"),
    //       Validators.minLength(3),
    //       Validators.maxLength(50),
    //     ],
    //   ],
    // });

    this.failureForm = createFailureForm(this.fb);

    // this.fb.group({
    //   failureCategory: ["", Validators.required],
    //   failureDescription: ["", Validators.required],
    //   nextSteps: ["", Validators.required],
    // });

    // // ✅ NEW: create empty shells; populate after data is loaded
    this.primaryContactForm = createPrimaryContactForm(this.fb);
    //this.fb.group({
    //   firstName: ["", [Validators.required, Validators.pattern(this.NAME_RE)]],
    //   lastName: ["", [Validators.required, Validators.pattern(this.NAME_RE)]],
    //   email: [
    //     "",
    //     [
    //       Validators.required,
    //       Validators.email,
    //       Validators.pattern(this.EMAIL_RE),
    //     ],
    //   ],
    //   phoneNumber: [
    //     "",
    //     [Validators.required, Validators.pattern(this.PHONE_RE)],
    //   ],
    // });

    this.businessAddressForm = createBusinessAddressForm(this.fb);

    // this.fb.group({
    //   streetAddress1: ["", [Validators.required]],
    //   streetAddress2: [""],
    //   city: ["", [Validators.required, Validators.pattern(this.CITY_RE)]],
    //   state: ["", [Validators.required]],
    //   zipCode: ["", [Validators.required, Validators.pattern(this.ZIP_RE)]],
    // });

    // this.registeredAgentForm = this.fb.group({
    //   firstName: ["", [Validators.required, Validators.pattern(this.NAME_RE)]],
    //   lastName: ["", [Validators.required, Validators.pattern(this.NAME_RE)]],
    //   streetAddress1: ["", [Validators.required]],
    //   streetAddress2: [""],
    //   city: ["", [Validators.required, Validators.pattern(this.CITY_RE)]],
    //   state: ["", [Validators.required]],
    //   zipCode: ["", [Validators.required, Validators.pattern(this.ZIP_RE)]],
    //   email: [""], // not in your UI, left optional (no effect)
    //   phoneNumber: [""], // not in your UI, left optional (no effect)
    // });

    this.registeredAgentForm = createRegisteredAgentForm(this.fb);
    this.managersForm = createManagerForm(this.fb);

    // this.fb.array([]);

    this.membersForm = createMembersForm(this.fb);
    this.managementForm = this.fb.group({
      managers: this.managersForm,
      members: this.membersForm,
      // ... you can add other controls here if needed
    });

    // this.fb.array([]);
  }

  // Helpers to build rows for arrays
  private buildPersonGroup(from: any, isMember = false) {
    return createPersonGroup(this.fb, from, isMember);
  }

  // Expose getters if you ever want to inspect in TS
  get managers(): FormArray {
    return this.managersForm;
  }
  get members(): FormArray {
    return this.membersForm;
  }

  shouldShowRAToggle(): boolean {
    const s6 = this.data?.step6;
    if (!s6) return false;
    if (s6.useAddress) return false; // already using company address → hide
    return !!(
      (s6.firstName && s6.firstName.trim()) ||
      (s6.lastName && s6.lastName.trim()) ||
      (s6.streetAddress1 && s6.streetAddress1.trim()) ||
      (s6.city && s6.city.trim()) ||
      (s6.state && s6.state.trim()) ||
      (s6.zipCode && String(s6.zipCode).trim())
    );
  }

  private lockRegisteredAgentEditing(): void {
    this.isEditing["registeredAgent"] = false;
  }

  private reloadProgressFromServer(): void {
    if (!this.companyId) return;
    this.fillerService
      .getUserProgressByCompanyId(this.companyId)
      .subscribe((progress) => {
        this.data = progress;
        this.fillerService.setCurrentProgress(progress);
        if (this.data?.step6?.useAddress) {
          this.lockRegisteredAgentEditing();
        }
        // Keep validators synced
        this.hydrateValidationFormsFromData();
      });
  }

  onUseCompanyRegAddressToggle(evt: { checked: boolean }) {
    if (!evt?.checked) return;

    const state = this.data?.step1 || "";
    this.raToggleLoading = true;
    this.loadingService.show("Fetching registered agent address…");

    this.formationService.getAgentDetails(state).subscribe({
      next: (agent) => {
        // Update local state
        this.data.step6 = this.data.step6 || {};
        this.data.step6.firstName =
          agent.firstName || this.data.step6.firstName || "";
        this.data.step6.lastName =
          agent.lastName || this.data.step6.lastName || "";
        this.data.step6.streetAddress1 = agent.streetAddress1 || "";
        this.data.step6.streetAddress2 = agent.streetAddress2 || "";
        this.data.step6.city = agent.city || "";
        this.data.step6.state = state;
        this.data.step6.zipCode = agent.zipCode || "";
        this.data.step6.useAddress = true; // flip only AFTER success

        this.isRAToggled = true; // mark as toggled (for UI)
        this.isEditing["registeredAgent"] = false; // lock manual edits
        this.hasChanges = true;
        this.notesEnabled = true;

        // Sync RA validation form with the new values
        this.hydrateRegisteredAgentForm();

        // --- PERSIST IMMEDIATELY ---
        const payload = {
          firstName: this.data.step6.firstName || "",
          lastName: this.data.step6.lastName || "",
          streetAddress1: this.data.step6.streetAddress1 || "",
          streetAddress2: this.data.step6.streetAddress2 || "",
          city: this.data.step6.city || "",
          state: this.data.step6.state || "",
          zipCode: this.data.step6.zipCode || "",
        };

        // 1) Save RA details (mark as ours/company)
        this.formationService
          .saveRegisteredAgent(this.companyId!, payload, true)
          .subscribe({
            next: () => {
              // 2) Persist wizard progress flag (useAddress)
              const systemNote =
                "System: Registered Agent set to company address via toggle";
              this.fillerService
                .updateCompanyData(
                  this.companyId!,
                  {
                    ...this.data,
                    step6: { ...this.data.step6, useAddress: true },
                  },
                  { registeredAgent: true },
                  systemNote,
                  +this.loginUserId
                )
                .subscribe({
                  next: () => {
                    // 3) Re-sync local memory from backend
                    this.reloadProgressFromServer();
                    this.snackBarService.showSuccess(
                      "Registered Agent saved to company address.",
                      "Close"
                    );
                  },
                  error: (err) =>
                    this.snackBarService.showError(
                      err?.message || "Failed to persist toggle state"
                    ),
                  complete: () => {
                    this.loadingService.hide();
                    this.raToggleLoading = false;
                  },
                });
            },
            error: (err) => {
              this.loadingService.hide();
              this.raToggleLoading = false;
              this.snackBarService.show(
                err?.message || "Failed to save Registered Agent",
                "Close"
              );
            },
          });
        // --- END PERSIST ---
      },
      error: (err) => {
        this.loadingService.hide();
        this.raToggleLoading = false;
        this.snackBarService.show(
          err?.message || "Failed to fetch agent address",
          "Close"
        );
      },
    });
  }

  saveChanges() {
    if (this.isRAToggled && this.hasChanges && this.notesEnabled) {
      const payload = {
        firstName: this.data.step6.firstName || "",
        lastName: this.data.step6.lastName || "",
        streetAddress1: this.data.step6.streetAddress1 || "",
        streetAddress2: this.data.step6.streetAddress2 || "",
        city: this.data.step6.city || "",
        state: this.data.step6.state || "",
        zipCode: this.data.step6.zipCode || "",
      };

      this.formationService
        .saveRegisteredAgent(this.companyId!, payload, true)
        .subscribe({
          next: () => {
            this.snackBarService.showSuccess(
              "Registered Agent set to company address.",
              "Close"
            );
            this.isRAToggled = false;
          },
          error: (err) => {
            this.snackBarService.showError(
              err?.message || "Failed to save Registered Agent."
            );
          },
          complete: () => {
            this.loadingService.hide();
          },
        });
    } else {
      this.snackBarService.showError(
        "Please make changes and save them.",
        "Close"
      );
    }
  }

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.companyId = Number(qp.get("companyId"));
    this.initialStep = Number(qp.get("step")) || 0;
    this.initializeForms();

    if (this.companyId) {
      this.loadingService.show("Fetching company Details…");
      this.fillerService
        .getUserProgressByCompanyId(this.companyId)
        .subscribe((progress) => {
          this.data = progress;
          this.managementstyle = this.data?.managementStyle;
          this.fillerService.setCurrentProgress(progress);
          this.loading = false;
          this.loadingService.hide();
          if (this.data?.step6?.useAddress) {
            this.lockRegisteredAgentEditing();
          }

          // ✅ Build/refresh validation forms from API data
          this.hydrateValidationFormsFromData();

          // Keep your original preview fetch logic
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
                  this.loading = false;
                },
              });
          } else {
            this.loading = false;
            this.loadingService.hide();
          }
        });
      console.log(this.hasChanges);
    }

    this.fillerService.currentProgress$.subscribe((progress) => {
      if (progress?.companyId === this.companyId) {
        this.data = progress;
        // keep validators in sync if data updates in background
        this.hydrateValidationFormsFromData();
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

  // ✅ Hydrate all validator forms from current this.data (no HTML changes)
  private hydrateValidationFormsFromData(): void {
    this.hydratePrimaryContactForm();
    this.hydrateManagersForm();
    this.hydrateMembersForm();
    this.hydrateBusinessAddressForm();
    this.hydrateRegisteredAgentForm();
  }

  private hydratePrimaryContactForm(): void {
    const s5 = this.data?.step5 || {};
    this.primaryContactForm.setValue(
      {
        firstName: s5.firstName || "",
        lastName: s5.lastName || "",
        email: s5.email || "",
        phoneNumber: s5.phoneNumber || "",
      },
      { emitEvent: false }
    );
  }

  private hydrateBusinessAddressForm(): void {
    const s14 = this.data?.step14 || {};
    this.businessAddressForm.setValue(
      {
        streetAddress1: s14.streetAddress1 || "",
        streetAddress2: s14.streetAddress2 || "",
        city: s14.city || "",
        state: this.data?.step1 || "", // your HTML shows state = data.step1
        zipCode: s14.zipCode || "",
      },
      { emitEvent: false }
    );
  }

  private hydrateRegisteredAgentForm(): void {
    const s6 = this.data?.step6 || {};
    this.registeredAgentForm.setValue(
      {
        firstName: s6.firstName || "",
        lastName: s6.lastName || "",
        streetAddress1: s6.streetAddress1 || "",
        streetAddress2: s6.streetAddress2 || "",
        city: s6.city || "",
        state: s6.state || "",
        zipCode: s6.zipCode || "",
        email: s6.email || "",
        phoneNumber: s6.phoneNumber || "",
      },
      { emitEvent: false }
    );
  }

  private hydrateManagersForm(): void {
    const arr = (this.data?.step13a || []) as any[];
    this.managersForm.clear({ emitEvent: false });
    arr.forEach((m) =>
      this.managersForm.push(this.buildPersonGroup(m), { emitEvent: false })
    );
  }

  private hydrateMembersForm(): void {
    const arr = (this.data?.step13b || []) as any[];
    this.membersForm.clear({ emitEvent: false });
    arr.forEach((m) =>
      this.membersForm.push(this.buildPersonGroup(m, true), {
        emitEvent: false,
      })
    );
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

    const isBackFromPreview =
      event.selectedIndex === this.getBusinessAddressIndex() &&
      event.previouslySelectedIndex === this.getPreviewIndex();

    if (isBackFromPreview) {
      this.reloadProgressFromServer(); // silent fetch, keeps validators updated too
    }
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
    if (sectionKey === "registeredAgent" && this.data?.step6?.useAddress) {
      this.snackBarService.show(
        "Disable company address in customer flow to edit these fields.",
        "Close"
      );
      return;
    }
    this.isEditing[sectionKey] = !this.isEditing[sectionKey];
  }

  onFieldChange(): void {
    this.hasChanges = true;
    this.notesEnabled = true;
    // We keep template-driven binding, but also keep validator forms in sync lightly
    // (We lazily re-hydrate during validate step to avoid heavy per-keystroke sync)
  }

  // ---------- File handling (unchanged) ----------
  onFilesSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
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
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      this.uploadError = validation.error!;
      return;
    }
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
    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return { isValid: false, error: "Only PDF files are allowed" };
    }
    const fileName = file.name.toLowerCase();
    const hasValidExtension = this.ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    if (!hasValidExtension)
      return { isValid: false, error: "File must have a .pdf extension" };
    if (file.size > this.MAX_FILE_SIZE) {
      const maxSizeMB = this.MAX_FILE_SIZE / (1024 * 1024);
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeMB}MB`,
      };
    }
    if (file.size === 0)
      return { isValid: false, error: "File cannot be empty" };
    return { isValid: true };
  }
  private sanitizeFile(file: File): FileWithPreview | null {
    try {
      const sanitizedName = this.sanitizeFileName(file.name);
      const sanitizedFile = new File([file], sanitizedName, {
        type: "application/pdf",
        lastModified: Date.now(),
      }) as FileWithPreview;
      sanitizedFile.isValid = true;
      return sanitizedFile;
    } catch {
      return null;
    }
  }
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .substring(0, 100)
      .replace(/_{2,}/g, "_")
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
  // ---------- End file handling ----------

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

    this.fillerService
      .uploadDocument(
        this.companyId,
        documentType,
        this.selectedFile,
        "notify_success",
        this.loginUserId
      )
      .subscribe({
        next: (res: any) => {
          this.uploadProgress = 100;
          this.snackBarService.showSuccess(
            res?.message || "Document uploaded successfully",
            "Close"
          );
          this.closeWizard();
        },
        error: () => {
          this.uploadProgress = 0;
          this.uploadError = "Upload failed. Please try again.";
        },
      });
  }

  private toYMD(val: any): string | null {
    if (!val) return null;
    const d = val instanceof Date ? val : new Date(val);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  private mergeFormsIntoData(): void {
    if (this.primaryContactForm?.dirty || this.isEditing["primaryContact"]) {
      this.data.step5 = { ...this.primaryContactForm.value };
    }
    if (this.businessAddressForm?.dirty || this.isEditing["businessAddress"]) {
      this.data.step14 = { ...this.businessAddressForm.value };
    }
    if (this.registeredAgentForm?.dirty || this.isEditing["registeredAgent"]) {
      this.data.step6 = {
        ...this.data.step6,
        ...this.registeredAgentForm.value,
      };
    }
    if (this.managersForm?.dirty || this.isEditing["managers"]) {
      this.data.step13a = this.managersForm.value;
    }
    if (this.membersForm?.dirty || this.isEditing["members"]) {
      this.data.step13b = this.membersForm.value;
    }
  }
  // ✅ Gate your existing save flow with validator checks (no HTML change)
  saveAndContinue(): void {
    if (this.companyId == null) return;
    this.mergeFormsIntoData();
    // Sync validator forms from latest data just before validating
    // this.hydrateValidationFormsFromData();

    // Validate only the section relevant to current step
    if (!this.validateCurrentStep()) {
      return; // snack shown inside validateCurrentStep
    }

    if (!this.changeNotes || !this.changeNotes.trim()) {
      this.snackBarService.show(
        "Please enter change notes before saving",
        "Close"
      );
      return;
    }
    if (!this.loginUserId) {
      this.snackBarService.show(
        "Unable to determine current user—please log in again.",
        "Close"
      );
      return;
    }

    // Serialize Formation Date (step3)
    const payloadForServer = {
      ...this.data,
      step3: this.toYMD(this.data?.step3),
    };

    const changedSections = { ...this.isEditing };
    if (this.stepper?.selectedIndex === 0) {
      changedSections["business"] = true;
    }

    const notes = this.changeNotes;

    this.fillerService
      .updateCompanyData(
        this.companyId!,
        payloadForServer,
        changedSections,
        notes,
        +this.loginUserId
      )
      .subscribe({
        next: (response) => {
          if (typeof payloadForServer.step3 === "string") {
            this.data.step3 = new Date(payloadForServer.step3);
          }

          this.hasChanges = false;
          this.isEditing = {};
          this.changeNotes = "";
          this.notesEnabled = false;

          this.snackBarService.showSuccess(
            response || "Data saved successfully",
            "Close"
          );

          const businessAddressIndex = this.getBusinessAddressIndex();

          if (this.stepper.selectedIndex === businessAddressIndex) {
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

  private validateCurrentStep(): boolean {
    const idx = this.stepper?.selectedIndex ?? 0;

    // Step 0: Company Details (we validate only Primary Contact here)
    if (idx === 0) {
      if (this.primaryContactForm.invalid) {
        this.primaryContactForm.markAllAsTouched();
        this.snackBarService.show(
          "Fix Primary Contact fields before saving.",
          "Close"
        );
        return false;
      }
      return true;
    }

    // Managers step (if present)
    let cursor = 1; // after step 0
    const haveManagers = !!this.data?.step13a?.length;
    const haveMembers = !!this.data?.step13b?.length;

    if (haveManagers) {
      if (idx === cursor) {
        if (this.managersForm.invalid) {
          this.managersForm.markAllAsTouched();
          this.snackBarService.show(
            "Fix Manager details before saving.",
            "Close"
          );
          return false;
        }
        return true;
      }
      cursor++;
    }

    // Members step (if present)
    if (haveMembers) {
      if (idx === cursor) {
        if (this.membersForm.invalid) {
          this.membersForm.markAllAsTouched();
          this.snackBarService.show(
            "Fix Member details before saving.",
            "Close"
          );
          return false;
        }
        return true;
      }
      cursor++;
    }

    // Business Address step
    if (idx === cursor) {
      // Business address always validated
      if (this.businessAddressForm.invalid) {
        this.businessAddressForm.markAllAsTouched();
        this.snackBarService.show(
          "Fix Business Address before saving.",
          "Close"
        );
        return false;
      }

      // Registered Agent: validate only if NOT using company RA toggle
      const useCompanyRA = this.data?.step6?.useAddress === true;
      if (!useCompanyRA) {
        if (this.registeredAgentForm.invalid) {
          this.registeredAgentForm.markAllAsTouched();
          this.snackBarService.show(
            "Fix Registered Agent details before saving.",
            "Close"
          );
          return false;
        }
      }
      return true;
    }

    // Other steps (Preview / Ready to File / Filing Status) do not use these validators
    return true;
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

  private getBusinessAddressIndex(): number {
    let idx = 0; // Company Details
    if (this.data?.step13a?.length) idx++; // Managers
    if (this.data?.step13b?.length) idx++; // Members
    return idx + 1; // Business Address
  }

  private getPreviewIndex(): number {
    if (!this.data) return -1;
    let idx = 0; // Company Details
    if (this.data?.step13a?.length) idx++; // Managers
    if (this.data?.step13b?.length) idx++; // Members
    idx++; // Business Address
    return idx; // Preview
  }

  hasNonAlphanumeric(ctrlName: string): boolean {
    const ctrl = this.filingForm.get(ctrlName);
    const val = (ctrl?.value ?? "").toString();
    if (!val) return false;
    return /[^A-Za-z0-9]/.test(val);
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
        next: () => {
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

  // printDocument(): void {
  //   if (this.blobUrl) {
  //     const win = window.open(this.blobUrl, "_blank");
  //     win?.focus();
  //     win?.print();
  //     this.snackBarService.show("Document opened for printing", "Close");
  //   } else {
  //     this.snackBarService.show("No document available to print", "Close");
  //   }
  // }

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

    this.fillerService.createCompanyFiling(payload).subscribe({
      next: () => {
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
