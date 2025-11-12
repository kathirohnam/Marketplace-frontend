
// src/app/services/login/service-login.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OtpResponse, ValidateOtpResponse, UserProgress } from 'src/app/models/side-login';

@Injectable({ providedIn: 'root' })
export class ServiceLogin {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {}

  sendOtp(email: string): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(
      `${this.baseUrl}/token/generate`,
      { email },
      { headers: this.headers }
    );
  }

  validateOtp(email: string, token: string): Observable<ValidateOtpResponse> {
    return this.http.post<ValidateOtpResponse>(
      `${this.baseUrl}/token/validate`,
      { email, token },
      { headers: this.headers}
    );
  }

  /**
   * Log an audit entry; expect plain-text response
   */
  // logAudit(email: string): Observable<string> {
  //   const params = new HttpParams().set('email', email);
  //   return this.http.post(
  //     `${this.baseUrl}/token/audit`,
  //     {},
  //     { headers: this.headers, params, responseType: 'text' }
  //   );
  // }

  fetchProgress(login_user_id: string): Observable<UserProgress[]> {
    const params = new HttpParams().set('login_user_id', login_user_id);
    return this.http.get<UserProgress[]>(`${this.baseUrl}/getUserProgress`, {
      params,
    });
  }

  logout(): Observable<string> {
   
   
    return this.http.post<string>(
      `${this.baseUrl}/token/logout`,
      {}, // empty body
      {  responseType: 'text' as 'json' } // Ensure responseType is set to 'text'
    );
  }

}
