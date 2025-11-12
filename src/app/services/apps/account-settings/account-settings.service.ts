
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserModel } from 'src/app/models/account-settings';
import { ErrorHandlerUtil } from 'src/app/shared/error-handler.util';
@Injectable({
  providedIn: 'root',
})
export class AccountSettingService {
  private readonly apiUrl = `${environment.apiBaseUrl}`;
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerUtil
  ) {}

  private url(path: string): string {
    return `${this.apiUrl}/${path}`;
  }

  users: UserModel = {
    firstName: 'Jefrin',
    lastName: 'Joy',
    email: 'jIlla@gmail.com',
    phoneNumber: '123 4567 890',
  } as UserModel;

  updateprofile(userDetails: UserModel): Observable<any> {
    return this.http
      .put(`${this.url('user-wizard/updateProfile')}`, userDetails)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Failed to Update Profile.')
        )
      );
  }
}
