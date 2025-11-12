import { Component, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-profile-upload',
    imports: [MatIconModule, CommonModule],
    templateUrl: './profile-upload.component.html',
    styleUrl: './profile-upload.component.scss'
})
export class ProfileUploadComponent {
  selectedFile: File | null = null;
  previewImageUrl: SafeUrl | null = null;
  isDragOver = false;
  userForm: FormGroup;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private sanitizer: DomSanitizer, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      profileImage: [null]
    });
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = false;
    const files = e.dataTransfer?.files;
    if (files?.length) this.handleSelectedFile(files[0]);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleSelectedFile(file);
  }

  handleSelectedFile(file: File): void {
    this.selectedFile = file;
    this.previewImageUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
    this.userForm.patchValue({ profileImage: file });
  }

  removeSelectedImage(): void {
    this.selectedFile = null;
    this.previewImageUrl = null;
    this.userForm.patchValue({ profileImage: null });
    this.fileInput.nativeElement.value = '';
  }
}