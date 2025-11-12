import { Component, Inject, Optional } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DocumentService } from "src/app/services/apps/document/document.service";
import { Company } from "src/app/models/document-list";
import { MaterialModule } from "src/app/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgIcon } from "@ng-icons/core";
import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { SnackBarService } from "src/app/shared/snackbar.service";
@Component({
    selector: "app-company-dialog-content",
    templateUrl: "./company-dialog-content.component.html",
    imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        // NgIcon,
        CommonModule,
    ]
})
export class CompanyDialogContentComponent {
  action: string;
  companyForm: FormGroup;
  isLoading = false;
  localData: Partial<Company>; // Made public for template access

  constructor(
    public dialogRef: MatDialogRef<CompanyDialogContentComponent>,
    private companyService: DocumentService,
    private fb: FormBuilder,
    private SnackBarService: SnackBarService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { action: string; company: Partial<Company> }
  ) {
    this.action = data.action;
    this.localData = { ...data.company };

    this.companyForm = this.fb.group({
      companyName: [
        this.localData.companyName || "",
        [Validators.required, Validators.minLength(2)],
      ],
      jurisdiction: [
        this.localData.jurisdiction || "",
        [Validators.required, Validators.minLength(2)],
      ],
      uploadedOn: [
        this.localData.uploadedOn
          ? new Date(this.localData.uploadedOn).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        Validators.required,
      ],
      type: [
        this.localData.type || "",
        [Validators.required, Validators.minLength(2)],
      ],
    });
  }

  doAction(): void {
    if (this.companyForm.invalid) {
      this.SnackBarService.show(
        "Please fill out all required fields correctly.",
        "error"
      );
      return;
    }

    this.isLoading = true;
    const companyData: Partial<Company> = this.companyForm.value;

    if (this.action === "Add") {
      this.companyService.addCompany(companyData).subscribe({
        next: () => this.handleSuccess("Company added successfully"),
      });
    } else if (this.action === "Update") {
      const updatedCompany = { ...this.localData, ...companyData };
      this.companyService.updateCompany(updatedCompany).subscribe({
        next: () => this.handleSuccess("Company updated successfully"),
      });
    } else if (this.action === "Delete") {
      this.companyService.deleteCompany(this.localData.id!).subscribe({
        next: () => this.handleSuccess("Company deleted successfully"),
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.SnackBarService.show("No file selected.", "error");
      return;
    }
    // Add file upload logic here if needed
  }

  private handleSuccess(message: string): void {
    this.SnackBarService.showSuccess(message);
    this.dialogRef.close({ event: "Refresh" });
    this.isLoading = false;
  }
}
