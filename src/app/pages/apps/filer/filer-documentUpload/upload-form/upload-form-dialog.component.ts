import { Component, Inject, ViewChild } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { FilerService } from 'src/app/services/apps/filer/filer.service';
import { DocumentType, UploadedFile } from 'src/app/models/filer';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SnackBarService } from 'src/app/shared/snackbar.service';
import { uploadviewerComponent } from 'src/app/shared/pdf-viewer.component';

@Component({
    selector: 'app-upload-form-dialog',
    imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
    templateUrl: './upload-form-dialog.component.html',
    styleUrls: ['./upload-form-dialog.component.scss']
})
export class UploadFormDialogComponent {
  @ViewChild('fileInput') fileInput: any;
  filteredDocumentTypes: DocumentType[] = [];
  documentTypes: DocumentType[] = [];
  selectedDocumentType = '';
  uploadFiles: UploadedFile[] = [];
  isUploading = false;
  isDragOver = false;
  isConfirmed = false;
  companyName = '';
  isEinSelected: boolean;
  readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  readonly allowedFileTypes = ['.pdf'];    // PDF only


  constructor(
    public dialogRef: MatDialogRef<UploadFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { companyId: number; companyName: string, isEinSelected: boolean },
    private fillerService: FilerService,
    private snackBarService: SnackBarService,
    private dialog: MatDialog
  ) {
    this.isEinSelected = this.data.isEinSelected;
    this.loadDocumentTypes();
    this.companyName = this.data.companyName || 'Unknown Company';
  }

  private loadDocumentTypes(): void {
    this.fillerService.getDocumentTypes().subscribe({
      next: (types) => {
        this.documentTypes = types.map((type: any) => ({
          documentTypeId: type.documentTypeId,
          typeName: type.typeName,
          description: type.description || type.typeName,
        }));

        // Filter the documentTypes based on the isEinSelected flag
        if (!this.isEinSelected) {
          this.filteredDocumentTypes = this.documentTypes.filter(
            (type) => type.typeName !== 'EinDocument'
          );
        } else {
          this.filteredDocumentTypes = this.documentTypes;
        }
      },
      error: () => {
        this.snackBarService.show('Failed to load document types', 'Close');
      },
    });
  }

  closeUploadForm(): void {
    this.dialogRef.close();
  }

  openDocumentViewer(companyId: number, file: File): void {
    const company = { id: companyId, name: this.companyName };
    this.dialog.open(uploadviewerComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      data: { company, file },
      autoFocus: false
    });
  }

  onDocumentTypeChange(newType: string): void {
    this.uploadFiles = [];
    this.isConfirmed = false;
    this.selectedDocumentType = newType;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.addFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  private addFiles(files: File[]): void {
    // Revoke and clear existing files and previews
    this.uploadFiles.forEach((fileObj) => {
      if (fileObj.preview) URL.revokeObjectURL(fileObj.preview);
    });
    this.uploadFiles = [];

    for (const file of files) {
      const extension = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
      if (!this.allowedFileTypes.includes(extension)) {
        this.snackBarService.show(`Only PDF files are allowed: ${file.name}`, 'Close');
        continue;
      }

      if (file.size > this.maxFileSize) {
        this.snackBarService.showError(
          `File ${file.name} exceeds the maximum size of 5MB`,
          'Close'
        );
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const uploadFile: UploadedFile = { file, preview: previewUrl };
      this.uploadFiles.push(uploadFile);
    }
  }

  removeFile(index: number): void {
    const fileToRemove = this.uploadFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    this.uploadFiles.splice(index, 1);
    if (this.uploadFiles.length === 0) {
      this.isConfirmed = false;
    }
  }

  uploadDocuments(): void {
    if (
      !this.data.companyId ||
      !this.selectedDocumentType ||
      this.uploadFiles.length === 0 ||
      !this.isConfirmed
    ) {
      this.snackBarService.show(
        'Please select a document type, add at least one file, and confirm before uploading',
        'Close'
      );
      return;
    }

    this.isUploading = true;
    let uploadedCount = 0;
    const totalFiles = this.uploadFiles.length;

    for (const fileObj of this.uploadFiles) {
      const filerLoginUserId =
        Number(localStorage.getItem('login_user_id')) || 0;
      this.fillerService
        .uploadDocument(
          this.data.companyId,
          this.selectedDocumentType,
          fileObj.file,
          'view',
          filerLoginUserId
        )
        .subscribe({
          next: () => {
            uploadedCount++;
            fileObj.progress = 100;
            if (uploadedCount === totalFiles) {
              this.isUploading = false;
              this.snackBarService.showSuccess(
                'All documents uploaded successfully',
                'Close'
              );
              this.uploadFiles = [];
              this.isConfirmed = false;
            }
          },
          error: (err) => {
            fileObj.error = 'Upload failed';
            this.snackBarService.showError(
              `Failed to upload ${fileObj.file.name}: ${err.message}`,
              'Close'
            );
            this.isUploading = false;
          },
        });
    }
  }

  // getDocumentDescription(): string {
  //   const selectedTypeObj = this.documentTypes.find(
  //     (t) => t.typeName === this.selectedDocumentType
  //   );
  //   return selectedTypeObj?.description || '';
  // }
  ngOnDestroy(): void {
    this.uploadFiles.forEach((fileObj) => {
      if (fileObj.preview) {
        URL.revokeObjectURL(fileObj.preview);
      }
    });
  }
}


