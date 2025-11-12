import {
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "src/app/material.module";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

// Import ngx-extended-pdf-viewer module
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";

@Component({
  selector: "app-uploadviewer",
  imports: [CommonModule, MaterialModule, NgxExtendedPdfViewerModule],
  template: `
    <div class="document-viewer">
      <div class="document-viewer-header" *ngIf="showHeader">
        <h2>{{ data?.company?.name ?? "Document" }}</h2>
        <button mat-icon-button (click)="closeDialog()" *ngIf="dialogRef">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="document-viewer-content" *ngIf="fileToShow">
        <ng-container [ngSwitch]="fileType">
          <ng-container *ngSwitchCase="'pdf'">
            <ngx-extended-pdf-viewer
              *ngIf="fileType === 'pdf' && objectUrlString"
              [src]="objectUrlString"
              useBrowserLocale="true"
              [height]="'100%'"
              [showDownloadButton]="false"
              [showPrintButton]="false"
              [showOpenFileButton]="false"
              [showPresentationModeButton]="false"
              [showSidebarButton]="true"
              [showFindButton]="true"
              [showPagingButtons]="true"
              [showZoomButtons]="true"
              [showSecondaryToolbarButton]="false"
              [showRotateButton]="false"
              [showPropertiesButton]="false"
              [showSpreadButton]="false"
              [showStampEditor]="false"
              [showDrawEditor]="false"
              [showTextEditor]="false"
            ></ngx-extended-pdf-viewer>
          </ng-container>

          <ng-container *ngSwitchCase="'image'">
            <img [src]="documentUrl" alt="Document preview" />
          </ng-container>

          <div *ngSwitchDefault class="unsupported-format">
            <mat-icon>warning</mat-icon>
            <p>This file format cannot be previewed directly.</p>
            <button mat-raised-button color="primary" (click)="downloadFile()">
              Download File
            </button>
          </div>
        </ng-container>
      </div>

      <div *ngIf="!fileToShow" class="empty-state">
        <mat-icon>description</mat-icon>
        <p>Select a document to view</p>
      </div>
    </div>
  `,
  styles: [
    `
      .document-viewer {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #fff;
      }
      .document-viewer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        background: #f5f5f5;
      }
      .document-viewer-header h2 {
        margin: 0;
        font-size: 20px;
      }
      .document-viewer-content {
        flex: 1;
        padding: 24px;
        overflow: auto;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        background: #fafafa;
      }
      ngx-extended-pdf-viewer {
        width: 100%;
        height: calc(90vh - 120px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      img {
        max-width: 100%;
        max-height: calc(90vh - 120px);
        object-fit: contain;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .unsupported-format {
        text-align: center;
        padding: 32px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .unsupported-format mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #f44336;
      }
      .empty-state {
        text-align: center;
        padding: 32px;
        color: #888;
      }
    `,
  ],
})
export class uploadviewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() file: File | null = null; // For template usage
  @Input() showHeader = true;

  fileToShow: File | null = null; // The actual file shown

  documentUrl: SafeResourceUrl | null = null;
  fileType: "pdf" | "image" | "other" = "other";
  private objectUrl: string | null = null;
  objectUrlString: string | null = null;

  constructor(
    @Optional() public dialogRef?: MatDialogRef<uploadviewerComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data?: { company?: { id: number; name: string }; file?: File },
    private sanitizer?: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Use dialog data file if present
    if (this.data?.file) {
      this.setFile(this.data.file);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Use input file if present and different from dialog data
    if (changes["file"] && this.file && this.file !== this.fileToShow) {
      this.setFile(this.file);
    }
  }

  private setFile(file: File): void {
    this.fileToShow = file;
    this.processFile(file);
  }

  private processFile(file: File) {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }

    this.documentUrl = null;
    this.objectUrlString = null;

    this.objectUrl = URL.createObjectURL(file);
    this.objectUrlString = this.objectUrl;

    // You don't need to use sanitizer here for ngx-extended-pdf-viewer

    if (file.type === "application/pdf") {
      this.fileType = "pdf";
    } else if (file.type.startsWith("image/")) {
      this.fileType = "image";
    } else {
      this.fileType = "other";
    }
  }

  downloadFile() {
    if (this.fileToShow && this.objectUrl) {
      const a = document.createElement("a");
      a.href = this.objectUrl;
      a.download = this.fileToShow.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  closeDialog(): void {
    this.dialogRef?.close();
  }

  ngOnDestroy() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }
}
