import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
  TextOnlySnackBar,
} from "@angular/material/snack-bar";
import { OverlayContainer } from "@angular/cdk/overlay";

@Injectable({
  providedIn: "root",
})
export class SnackBarService {
  constructor(
    private snackBar: MatSnackBar,
    private overlayContainer: OverlayContainer
  ) {}

  private setContainerActive(active: boolean) {
    const el = this.overlayContainer.getContainerElement();
    el.classList.toggle("snackbar-active", active);
  }

  private attachAutoCleanup<T>(ref: MatSnackBarRef<T>) {
    this.setContainerActive(true);
    ref.afterDismissed().subscribe(() => this.setContainerActive(false));
  }

  show(message: string, action: string = "Close", config?: MatSnackBarConfig) {
    const defaultConfig: MatSnackBarConfig = {
      duration: 2000,
      horizontalPosition: "center",
      verticalPosition: "bottom",
      ...config,
    };
     const ref = this.snackBar.open(
       message,
       action,
       defaultConfig
     ) as MatSnackBarRef<TextOnlySnackBar>;
    // this.snackBar.open(message, action, defaultConfig);
     this.attachAutoCleanup(ref);
  }

  showError(
    message: string,
    action: string = "Close",
    config?: MatSnackBarConfig
  ) {
    this.show(message, action, {
      duration: 2000,
      panelClass: ["snackbar-error"],
      ...config,
    });
  }

  showSuccess(
    message: string,
    action: string = "Close",
    config?: MatSnackBarConfig
  ) {
    this.show(message, action, {
      duration: 2000,
      panelClass: ["snackbar-success"],
      ...config,
    });
  }
}
