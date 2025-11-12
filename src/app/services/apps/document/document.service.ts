import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, retryWhen, mergeMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Company, DocumentType } from 'src/app/models/document-list';
import { ErrorHandlerUtil } from 'src/app/shared/error-handler.util';

/** Generic paged response shape */
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly apiUrl = environment.apiBaseUrl;
  private readonly pagedUrl = `${this.apiUrl}/pdf/getAllFileDetailsBySearch`;

  // private cachedAllCompanies: Company[] | null = null;
  // private cachedUserCompanies: Company[] | null = null;
  private cachedStates: string[] | null = null;
  private cachedDocumentTypes: DocumentType[] | null = null;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerUtil
  ) {}

  /**
   * Admin-only: fetch a page with optional filters
   */
  fetchAdminPage(
    page: number,
    size: number,
    companyName: string = '',
    state: string = '',
    typeName: string = ''
  ): Observable<PagedResponse<Company>> {
    const params =
      `?page=${page}&size=${size}` +
      (companyName ? `&companyName=${encodeURIComponent(companyName)}` : '') +
      (state ? `&state=${encodeURIComponent(state)}` : '') +
      (typeName ? `&typeName=${encodeURIComponent(typeName)}` : '');

    return this.http.get<PagedResponse<Company>>(this.pagedUrl + params).pipe(
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((err, retryCount) => {
            if (err.status === 429 && retryCount < 2) {
              // Retry after exponential backoff: 1s, then 2s
              return timer(1000 * Math.pow(2, retryCount));
            }
            return throwError(() => err);
          })
        )
      ),
      tap((resp) => {
        // const all = (this.cachedAllCompanies || []).concat(resp.content);
        // const map = new Map<number, Company>();
        // all.forEach((c) => {
        //   const key = c.companyId ?? c.id!;
        //   map.set(key, c);
        // });
        // this.cachedAllCompanies = Array.from(map.values());
      }),
      catchError((err) => {
        if (err.status === 429) {
          return throwError(
            () =>
              new Error(
                'You’re making requests too quickly. Please wait a moment and try again.'
              )
          );
        }
        return this.errorHandler.handleError(
          err,
          'Failed to load companies'
        ) as Observable<PagedResponse<Company>>;
      })
    );
  }

  getUserCompanies(
    userId: string | null,
    forceRefresh = false
  ): Observable<Company[]> {
    if (!userId) {
      return throwError(() => new Error('User ID is required'));
    }
    // if (!forceRefresh && this.cachedUserCompanies) {
    //   return of(this.cachedUserCompanies);
    // }
    return this.http
      .get<Company[]>(
        `${this.apiUrl}/pdf/getUserFileDetails?loginUserId=${userId}`
      )
      .pipe(
        // tap((data) => (this.cachedUserCompanies = data)),
        catchError(
          (err) =>
            this.errorHandler.handleError(
              err,
              'Failed to fetch document'
            ) as Observable<Company[]>
        )
      );
  }

  getFile(
    companyId: number,
    documentType: string,
    action: string
  ): Observable<Blob> {
    if (!companyId || !documentType) {
      return throwError(
        () => new Error('Company ID and document type are required')
      );
    }
    return this.http
      .get(
        `${this.apiUrl}/pdf/getFile?companyId=${companyId}&documentType=${documentType}&action=${action}`,
        {
          responseType: 'blob',
        }
      )
      .pipe(
        catchError(
          (err) =>
            this.errorHandler.handleError(
              err,
              'Failed to fetch document'
            ) as Observable<Blob>
        )
      );
  }

  addCompany(company: Partial<Company>): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/addCompany`, company).pipe(
      tap(() => this.clearCachedData()),
      catchError(
        (err) =>
          this.errorHandler.handleError(
            err,
            'Failed to add company'
          ) as Observable<void>
      )
    );
  }

  updateCompany(company: Partial<Company>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/updateCompany`, company).pipe(
      tap(() => this.clearCachedData()),
      catchError(
        (err) =>
          this.errorHandler.handleError(
            err,
            'Failed to update company'
          ) as Observable<void>
      )
    );
  }

  deleteCompany(companyId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/deleteCompany/${companyId}`)
      .pipe(
        tap(() => this.clearCachedData()),
        catchError(
          (err) =>
            this.errorHandler.handleError(
              err,
              'Failed to delete company'
            ) as Observable<void>
        )
      );
  }

  // getCachedAllCompanies(): Company[] | null {
  //   return this.cachedAllCompanies;
  // }

  // getCachedUserCompanies(): Company[] | null {
  //   return this.cachedUserCompanies;
  // }

  refreshUserCompanies(userId: string | null): Observable<Company[]> {
    return this.getUserCompanies(userId, true);
  }

  clearCachedData(): void {
    // this.cachedAllCompanies = null;
    // this.cachedUserCompanies = null;
    this.cachedStates = null;
    this.cachedDocumentTypes = null;
  }

  getStates(forceRefresh = false): Observable<string[]> {
    if (!forceRefresh && this.cachedStates) {
      return of(this.cachedStates);
    }
    return this.http.get<string[]>(`${this.apiUrl}/company/states`).pipe(
      tap((data) => (this.cachedStates = data)),
      catchError(
        (err) =>
          this.errorHandler.handleError(
            err,
            'Failed to load states'
          ) as Observable<string[]>
      )
    );
  }

  getDocumentTypes(forceRefresh = false): Observable<DocumentType[]> {
    if (!forceRefresh && this.cachedDocumentTypes) {
      return of(this.cachedDocumentTypes);
    }
    return this.http
      .get<DocumentType[]>(`${this.apiUrl}/company/getDocumentTypeList`)
      .pipe(
        tap((data) => (this.cachedDocumentTypes = data)),
        catchError(
          (err) =>
            this.errorHandler.handleError(
              err,
              'Failed to load document types'
            ) as Observable<DocumentType[]>
        )
      );
  }
}
