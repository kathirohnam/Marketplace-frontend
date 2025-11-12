
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SnackBarService } from 'src/app/shared/snackbar.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token/token.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerUtil {
  private readonly baseUrl = environment.apiBaseUrl;
  constructor(
    private snackBarService: SnackBarService,
    
  ) {}

  handleError(error: any, frontendMsg: string) {
    
    let backendMsg: string | null = null;

    if (error instanceof HttpErrorResponse) {
      // Case 1: Plain string response (text/plain)
      if (typeof error.error === 'string') {
        backendMsg = error.error;

        // Case 2: JSON object with 'message' field (Spring's ResponseStatusException)
      } else if (typeof error.error === 'object' && error.error?.message) {
        backendMsg = error.error.message;
      }
    }

    const finalMessage = backendMsg || frontendMsg;
    this.snackBarService.showError(finalMessage);

    return throwError(() => error);
  }
}