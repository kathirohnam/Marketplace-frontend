

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserProgress, CompanyDetails } from 'src/app/models/dashboard';
import { ErrorHandlerUtil } from 'src/app/shared/error-handler.util';
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient , private errorHandler : ErrorHandlerUtil) {}

  getUserProgress(userId: number): Observable<UserProgress[]> {
    const url = `${this.baseUrl}/user-wizard/getUserProgress?login_user_id=${userId}`;
    return this.http.get<UserProgress[]>(url).pipe(
      catchError((error) =>
        this.errorHandler.handleError(error, 'Error fetching data. Please try again later.')
      )
    );
  }

  getUserProgressByCompanyId(companyId: number): Observable<CompanyDetails> {
    const url = `${this.baseUrl}/user-wizard/getUserProgressByCompanyId?companyId=${companyId}`;
    return this.http.get<CompanyDetails>(url).pipe(
     catchError((error) =>
        this.errorHandler.handleError(error, 'Company details not found.')
      )
    );
  }

 
}
