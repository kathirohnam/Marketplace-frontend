// safe-url.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
    name: 'safeUrl',
    standalone: false
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string | SafeResourceUrl | undefined): SafeResourceUrl {
    if (!url) {
      // Return an empty safe URL if url is undefined
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    if (typeof url === 'string') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    // If the value is already a SafeResourceUrl, just return it.
    return url;
  }
}
