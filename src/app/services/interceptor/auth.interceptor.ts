import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, switchMap, finalize, filter, take } from 'rxjs/operators';
import { TokenService } from '../token/token.service';
import { SnackBarService } from 'src/app/shared/snackbar.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly refreshUrl = `${this.baseUrl}/token/refresh`;

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private tokenService: TokenService,
    private http: HttpClient,
    private snackBar: SnackBarService
  ) {}

  /** Attach credentials and (optionally) the Authorization header */
  private addAuth(req: HttpRequest<any>, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return req.clone({
      withCredentials: true,
      setHeaders: headers,
    });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const access = this.tokenService.getToken();
    const authReq = this.addAuth(req, access || undefined);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        const isAuthError = error.status === 401 || error.status === 403;
        const isRefreshCall = req.url.includes('/token/refresh');

        // Only handle 401/403 here; never recurse on the refresh call itself
        if (!isAuthError || isRefreshCall) {
          return throwError(() => error);
        }

        if (!this.isRefreshing) {
          // First failing request → start refresh
          this.isRefreshing = true;
          this.refreshTokenSubject.next(null);

          const email = this.tokenService.getEmail(); // string | null

          // If your backend REQUIRES email for refresh, guard it.
          if (!email) {
            // Cannot refresh without the identifier → hard logout
            this.tokenService.clearToken();
            this.snackBar.showError('Session expired. Please log in again.');
            return throwError(() => error);
          }

          const params = new HttpParams().set('email', email);

          return this.http
            .post<any>(this.refreshUrl, null, {
              withCredentials: true,
              params,
            })
            .pipe(
              switchMap((res) => {
                if (res?.accessToken) this.tokenService.saveToken(res.accessToken);
                if (res?.idToken) this.tokenService.saveToken(res.idToken, 'id');

                // release queued requests
                this.refreshTokenSubject.next(res.accessToken);

                // retry the original request with the fresh token
                const retryReq = this.addAuth(req, res.accessToken);
                return next.handle(retryReq);
              }),
               catchError((refreshErr: any) => {
  if (refreshErr.status === 401 || refreshErr.status === 403) {
    console.log("testing refresh token");
    this.tokenService.clearToken();
    this.snackBar.showError('Session expired. Please log in again.');
    return throwError(() => refreshErr);
  } else {
    console.log("else block");
    this.snackBar.showError('Something went wrong. Please try again.');
    return throwError(() => refreshErr);
  }
}),

              finalize(() => {
                this.isRefreshing = false;
              })
            );
        } else {
          // Already refreshing → queue this request until refresh finishes
          return this.refreshTokenSubject.pipe(
            filter((t): t is string => t !== null),
            take(1),
            switchMap((token) => next.handle(this.addAuth(req, token)))
          );
        }
      })
    );
  }
}
