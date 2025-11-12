import { Component, Inject, OnInit, OnDestroy } from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DocumentService } from "src/app/services/apps/document/document.service";
import { Company } from "src/app/models/document-list";
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { SharedPipesModule } from "../shared-pipes.module";
import { HttpErrorResponse } from "@angular/common/http";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { uploadviewerComponent } from "src/app/shared/pdf-viewer.component";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "src/app/material.module";
import { LoadingService } from "src/app/services/loading/loading.service";

@Component({
  selector: "app-document-viewer-dialog",
  imports: [
    MatDialogModule,
    SharedPipesModule,
    uploadviewerComponent,
    CommonModule,
    MaterialModule,
  ],
  templateUrl: "./document-viewer-dialog.component.html",
  styleUrls: ["./document-viewer-dialog.component.scss"],
})
export class DocumentViewerDialogComponent implements OnInit, OnDestroy {
  documentUrl: string = ""; // Changed to string, initialized as empty
  private blobUrl: string | null = null;
  isLoading = false;
  fileToShow!: File;

  constructor(
    public dialogRef: MatDialogRef<DocumentViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      documentBlob: Blob;
      company: Company;
      companyId: number;
      documentType: string;
    },
    private sanitizer: DomSanitizer,
    private companyService: DocumentService,
    private SnackBarService: SnackBarService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingService.show("Generating Document Preview...");
    try {
      this.blobUrl = URL.createObjectURL(this.data.documentBlob);
      this.documentUrl = this.blobUrl;

      // Create a File object from the Blob for uploadviewerComponent
      this.fileToShow = new File(
        [this.data.documentBlob],
        `${this.data.documentType}.pdf`,
        { type: this.data.documentBlob.type }
      );
    } catch (error) {
      this.SnackBarService.show("Failed to load document preview.", "error");
      this.dialogRef.close();
    }
    this.loadingService.hide();
  }

  downloadDocument(): void {
    this.loadingService.show("Downloading...");
    this.isLoading = true;
    this.companyService
      .getFile(this.data.companyId, this.data.documentType, "download")
      .subscribe({
        next: (Response: any) => {
          if (this.data.documentBlob) {
            const downloadBlobUrl = URL.createObjectURL(this.data.documentBlob);
            const link = document.createElement("a");
            link.href = downloadBlobUrl;
            link.download = `${this.data.company.companyName}_${this.data.documentType}.pdf`; // Set the file name
            link.click();
            URL.revokeObjectURL(downloadBlobUrl); // Clean up after download

            this.SnackBarService.show(
              "Document downloaded successfully",
              "success"
            );
          } else {
            this.SnackBarService.show("Document blob not available.", "error");
          }

          this.isLoading = false;
        },
      });
    this.loadingService.hide();
  }

  printDocument(): void {
    this.loadingService.show("Preparing to Print...");
    if (!this.blobUrl) {
      this.SnackBarService.showError(
        "No document available to print.",
        "error"
      );
      return;
    }
    const printWindow = window.open(this.blobUrl, "_blank");
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    } else {
      this.SnackBarService.showError("Failed to open print window.", "error");
    }
    this.loadingService.hide();
  }

  ngOnDestroy(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
    }
    this.dialogRef.close("viewed");
  }
  closeDocumentViewer(): void {
    this.dialogRef.close();
  }
}
