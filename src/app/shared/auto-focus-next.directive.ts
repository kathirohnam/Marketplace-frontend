import { Directive, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appAutoFocusNext]',
  standalone: true,
})
export class AutoFocusNextDirective {
  @Input('appAutoFocusNext') targetElementId!: string;

  @HostListener('click')
  onClick() {
    if (!this.targetElementId) {
      return;
    }

    setTimeout(() => {
      const element = document.getElementById(this.targetElementId);

      // First, check if the element exists and is an input or textarea
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        
        // **NEW LOGIC IS HERE**
        // Only focus the element if its value is empty.
        if (element.value.trim() === '') {
          element.focus();
          element.select();
        }
        // If the element has a value, do nothing.

      } else if (element) {
        // Fallback for other non-input elements, focus them regardless
        element.focus();
      }
    }, 150);
  }
}