import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FilerService } from 'src/app/services/apps/filer/filer.service';
import { DocumentType, Filler, Document } from 'src/app/models/filer';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SnackBarService } from 'src/app/shared/snackbar.service';
import { uploadviewerComponent } from 'src/app/shared/pdf-viewer.component';

@Component({
    selector: 'app-document-viewer-dialog',
    imports: [CommonModule, MaterialModule, uploadviewerComponent],
    templateUrl: './document-viewer-dialog.component.html',
    styleUrls: ['./document-viewer-dialog.component.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DocumentViewerDialogComponent {
  documentTypes: DocumentType[] = [];
  filteredDocumentTypes: DocumentType[] = [];
  selectedCompany: Filler;
  selectedDocumentId: string = '';
  selectedDocument: Document | null = null;
  selectedFile: File | null = null; // <-- This will hold the File to pass to uploadviewerComponent
  isLoadingDocument = false;
  documentError: string | null = null;
  selectedFileblob: Blob;
  isEinSelected: boolean;  // Declare the property for isEinSelected

  constructor(
    public dialogRef: MatDialogRef<DocumentViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { company: Filler, isEinSelected: boolean },  // Receive isEinSelected from MAT_DIALOG_DATA
    private fillerService: FilerService,
    private snackBarService: SnackBarService
  ) {
    this.selectedCompany = data.company;
    this.isEinSelected = data.isEinSelected;  // Set the value of isEinSelected
    this.loadDocumentTypes();
  }

  private loadDocumentTypes(): void {
    this.fillerService.getDocumentTypes().subscribe({
      next: (types) => {
        // Map the document types from the API response
        this.documentTypes = types.map((type: any) => ({
          documentTypeId: type.documentTypeId,
          typeName: type.typeName,
          description: type.description || type.typeName,
        }));

        // Filter document types based on isEinSelected
        if (!this.isEinSelected) {
          this.filteredDocumentTypes = this.documentTypes.filter(
            (type) => type.typeName !== 'EinDocument'  // Exclude 'EinDocument' if isEinSelected is false
          );
        } else {
          this.filteredDocumentTypes = this.documentTypes;  // Show all types if isEinSelected is true
        }
      },
      error: (err) => {
        this.snackBarService.show('Failed to load document types', 'Close');
      },
    });
  }

  onDocumentSelect(docId: string): void {
    this.selectedFile = null;
    if (!docId) {
      this.clearDocument();
      return;
    }

    this.isLoadingDocument = true;
    this.documentError = null;

    const documentType = this.filteredDocumentTypes.find(
      (doc) => doc.documentTypeId === Number(docId)
    );
    if (documentType) {
      this.selectedDocument = {
        id: String(documentType.documentTypeId),
        name: documentType.typeName,
        type: 'pdf',
        uploadDate: new Date().toISOString(),
      };

      const filerLoginUserId =
        Number(localStorage.getItem('login_user_id')) || 0;
      this.fillerService
        .getFile(
          this.selectedCompany.id,
          documentType.typeName,
          'view',
          'view',
          filerLoginUserId
        )
        .subscribe({
          next: (blob: Blob) => {
            this.isLoadingDocument = false;
            // Convert blob to File object to pass to uploadviewerComponent
            this.selectedFileblob = blob;
            this.selectedFile = new File(
              [blob],
              `${documentType.typeName}.pdf`,
              { type: blob.type }
            );
          },
          error: (error) => {
            console.error('Error loading document:', error);
            this.documentError =
              'File not available or failed to load. Please upload it again...';
            this.isLoadingDocument = false;
          },
        });
    } else {
      this.documentError = 'Invalid document type selected.';
      this.isLoadingDocument = false;
    }
  }

  downloadSelectedDocument(): void {
    if (
      !this.selectedDocument ||
      !this.selectedCompany.id ||
      !this.selectedFileblob
    ) {
      this.snackBarService.show('No document selected', 'Close');
      return;
    }
    const filerLoginUserId = Number(localStorage.getItem('login_user_id')) || 0;
    this.isLoadingDocument = true;
    this.fillerService
      .getFile(
        this.selectedCompany.id,
        this.selectedDocument.name,
        'download',
        'view',
        filerLoginUserId
      )
      .subscribe({
        next: (response: any) => {
          // Check if selectedFileBlob is not null before creating a URL
          if (this.selectedFileblob) {
            const url = window.URL.createObjectURL(this.selectedFileblob);
            const a = document.createElement('a');
            a.href = url;

            // Check if selectedDocument is not null before accessing its name
            if (this.selectedDocument) {
              a.download = `${this.selectedCompany?.company}_${this.selectedDocument?.name}.pdf`;
            }

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.snackBarService.show('File downloaded successfully', 'close');
          } else {
            this.snackBarService.show('Failed to download document', 'Close');
          }
        },
      });
  }

  closeDocumentViewer(): void {
    this.clearDocument();
    this.dialogRef.close();
  }

  private clearDocument(): void {
    this.selectedFile = null;
    this.selectedDocument = null;
    this.documentError = null;
  }
}
