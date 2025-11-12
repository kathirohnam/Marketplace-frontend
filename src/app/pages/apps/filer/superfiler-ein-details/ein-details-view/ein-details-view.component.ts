import { Component, Inject, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SharedPipesModule } from '../../../document/shared-pipes.module';
import { SnackBarService } from 'src/app/shared/snackbar.service';
import { uploadviewerComponent } from 'src/app/shared/pdf-viewer.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';

@Component({
    selector: 'app-document-viewer-dialog',
    imports: [
        MatDialogModule,
        SharedPipesModule,
        uploadviewerComponent,
        CommonModule,
        MaterialModule,
    ],
    templateUrl: './ein-details-view.component.html',
    styleUrls: ['./ein-details-view.component.scss']
})
export class EinDetailsViewComponent implements OnInit, OnDestroy {
  documentUrl: string = '';
  private blobUrl: string | null = null;
  isLoading = false;
  fileToShow!: File;

  constructor(
    public dialogRef: MatDialogRef<EinDetailsViewComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      documentBlob: Blob;
      company: any;
      companyId: number;
      documentType: string;
    },
    private sanitizer: DomSanitizer,
    private snackBarService: SnackBarService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    try {
      const blob = this.data.documentBlob;
      this.blobUrl = URL.createObjectURL(blob);
      this.documentUrl = this.blobUrl;

      this.fileToShow = new File(
        [blob],
        `${this.data.documentType}.pdf`,
        { type: blob.type || 'application/pdf' }
      );
      this.renderer.addClass(this.el.nativeElement.parentElement, 'prevent-capture');
    } catch {
      this.snackBarService.show('Failed to load document preview.', 'error');
      this.dialogRef.close();
    }
  }

  downloadDocument(): void {
    if (!this.data?.documentBlob || !this.blobUrl) {
      this.snackBarService.show('Document blob not available.', 'error');
      return;
    }
    const safeName =
      `${this.data.company?.companyName || 'document'}_${this.data.documentType}.pdf`
        .replace(/[^\w.-]+/g, '_');

    const link = document.createElement('a');
    link.href = this.blobUrl;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBarService.show('Document downloaded successfully', 'success');
  }

  printDocument(): void {
    if (!this.blobUrl) {
      this.snackBarService.show('No document available to print.', 'error');
      return;
    }
    const printWindow = window.open(this.blobUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    } else {
      this.snackBarService.show('Failed to open print window.', 'error');
    }
  }

  ngOnDestroy(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
    }
    this.renderer.removeClass(this.el.nativeElement.parentElement, 'prevent-capture');
    this.dialogRef.close('viewed');
  }

  closeDocumentViewer(): void {
    this.dialogRef.close();
  }
}