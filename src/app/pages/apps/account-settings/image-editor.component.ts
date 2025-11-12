import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
  ImageTransform,
} from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

// Data passed into the dialog
export interface ImageEditorData {
  imageUrl?: string;
}

// Data returned from the dialog
export interface ImageEditResult {
  editedImageUrl: string;
  croppedImageBlob?: Blob;
}

interface Filter {
  name: string;
  class: string;
}

@Component({
  selector: 'app-image-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    ImageCropperComponent
  ],
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss']
})
export class ImageEditorComponent implements OnInit {
  // ---- Sources ----
  imageChangedEvent: Event | null = null;
  imageUrl: string | undefined = undefined;
  originalFile: File | null = null;

  // ---- Outputs / previews ----
  croppedImage: SafeUrl = '';
  croppedImageBlob: Blob | null = null;

  // ---- Cropper config ----
  aspectRatio = 1;
  resizeToWidth = 400;
  cropperMinWidth = 200;
  onlyScaleDown = false;
  roundCropper = true;
  imageQuality = 92;
  autoCrop = true;
  backgroundColor = '#f1f5f9';

  // ---- Transform state ----
  transform: ImageTransform = {
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false
  };

  // ---- UI state ----
  isLoading = false;
  hasImage = false;
  uploadError = '';
  showCropper = false;

  // ---- Filters State ----
  activeFilter: string = 'filter-none';
  filters: Filter[] = [
    { name: 'None', class: 'filter-none' },
    { name: 'Vivid', class: 'filter-vivid' },
    { name: 'Grayscale', class: 'filter-grayscale' },
    { name: 'Sepia', class: 'filter-sepia' },
    { name: 'Vintage', class: 'filter-vintage' }
  ];

  constructor(
    public dialogRef: MatDialogRef<ImageEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageEditorData,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.data?.imageUrl) {
      this.imageUrl = this.data.imageUrl;
      this.hasImage = true;
      this.showCropper = true;
    }
  }

  fileChangeEvent(event: Event): void {
    this.clearError();
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!this.validateFile(file)) {
        input.value = '';
        return;
    }

    this.originalFile = file;
    this.imageChangedEvent = event;
    this.imageUrl = undefined;
    this.hasImage = true;
    this.showCropper = true;
    this.resetImage();
  }

  private validateFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      this.uploadError = 'Only JPG and PNG files are allowed.';
      return false;
    }
    if (file.size > maxFileSize) {
      this.uploadError = 'File size must be less than 5MB.';
      return false;
    }
    return true;
  }
  
  imageCropped(event: ImageCroppedEvent): void {
    if (event.objectUrl) {
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    }
    this.croppedImageBlob = event.blob || null;
  }

  imageLoaded(_image: LoadedImage): void {
    this.showCropper = true;
    this.isLoading = false;
  }

  cropperReady(): void {
    this.isLoading = false;
  }

  loadImageFailed(): void {
    this.uploadError = 'Failed to load image. Please try a different file.';
    this.isLoading = false;
    this.showCropper = false;
  }

  onZoom(val: number): void {
    const next = Math.max(0.1, Math.min(5, Number(val)));
    this.transform = { ...this.transform, scale: next };
  }

  rotateLeft(): void {
    this.transform = { ...this.transform, rotate: (this.transform.rotate || 0) - 90 };
  }

  rotateRight(): void {
    this.transform = { ...this.transform, rotate: (this.transform.rotate || 0) + 90 };
  }

  flipHorizontal(): void {
    this.transform = { ...this.transform, flipH: !this.transform.flipH };
  }

  flipVertical(): void {
    this.transform = { ...this.transform, flipV: !this.transform.flipV };
  }

  toggleRoundCropper(isRound: boolean): void {
    this.roundCropper = isRound;
  }

  resetImage(): void {
    this.transform = { scale: 1, rotate: 0, flipH: false, flipV: false };
    this.activeFilter = 'filter-none';
  }

  applyFilter(filterClass: string): void {
    this.activeFilter = filterClass;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.croppedImageBlob) {
      this.uploadError = 'No image available to save.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result: ImageEditResult = {
        editedImageUrl: reader.result as string,
        croppedImageBlob: this.croppedImageBlob!,
      };
      this.dialogRef.close(result);
    };
    reader.readAsDataURL(this.croppedImageBlob);
  }

  triggerFileUpload(): void {
    document.getElementById('fileInput')?.click();
  }

  clearError(): void {
    this.uploadError = '';
  }
}

