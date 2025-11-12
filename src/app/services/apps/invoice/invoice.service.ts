// serviceinvoice.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { InvoiceList } from 'src/app/models/invoice';
import { ErrorHandlerUtil } from 'src/app/shared/error-handler.util';
import { HttpParams } from '@angular/common/http';

/** Wrapper for CRUD responses */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/** Shape of the paged response for Admin */
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly adminPagedUrl = `${environment.apiBaseUrl}/invoice/getAllInvoicebysearch`;
  private readonly userUrl = `${environment.apiBaseUrl}/invoice/getUserInvoice?loginUserId=`;

  private readonly invoiceList = signal<InvoiceList[]>([]);
  public readonly invoices = this.invoiceList.asReadonly();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerUtil
  ) {}

  /** Admin-only: fetch a page (with search) */
  fetchAdminPage(
    page: number,
    size: number,
    search: string = ''
  ): Observable<PagedResponse<InvoiceList>> {
    const key = `${page}_${size}_${search}`;

    // 2. Otherwise do the HTTP call...
    const params =
      `?page=${page}&size=${size}` +
      (search ? `&search=${encodeURIComponent(search)}` : '');

    return this.http
      .get<PagedResponse<InvoiceList>>(this.adminPagedUrl + params)
      .pipe(
        retry(2),
        tap((resp) => {
          // ─── Add this single line back ───
          this.invoiceList.set(resp.content);
        }),

        catchError((err) =>
          this.errorHandler.handleError(err, 'Failed to load invoices')
        )
      );
  }

  /** Non-admin: fetch full list once */

  fetchUserInvoices(loginUserId: string): Observable<InvoiceList[]> {
    return this.http.get<InvoiceList[]>(this.userUrl + loginUserId).pipe(
      retry(2),

      tap((list) => {
        this.invoiceList.set(list);
      }),

      catchError(
        (err) =>
          this.errorHandler.handleError(
            err,
            'Failed to load invoices'
          ) as Observable<InvoiceList[]>
      )
    );
  }

  deleteInvoice(id: number): Observable<ApiResponse<void>> {
    const url = `${environment.apiBaseUrl}/deleteInvoice/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() =>
        this.invoiceList.update((list) => list.filter((inv) => inv.id !== id))
      ),
      map(() => ({ success: true, message: 'Invoice deleted successfully' })),
      catchError(
        (err) =>
          this.errorHandler.handleError(
            err,
            'Failed to delete invoice'
          ) as Observable<ApiResponse<void>>
      )
    );
  }

  addInvoice(invoice: InvoiceList): Observable<ApiResponse<InvoiceList>> {
    const url = `${environment.apiBaseUrl}/addInvoice`;
    return this.http.post<InvoiceList>(url, invoice).pipe(
      tap((newInv) => this.invoiceList.update((list) => [...list, newInv])),
      map((data) => ({
        success: true,
        data,
        message: 'Invoice added successfully',
      })),
      catchError(
        (err) =>
          this.errorHandler.handleError(
            err,
            'Failed to add invoice'
          ) as Observable<ApiResponse<InvoiceList>>
      )
    );
  }

  updateInvoice(
    id: number,
    invoice: InvoiceList
  ): Observable<ApiResponse<InvoiceList>> {
    const url = `${environment.apiBaseUrl}/updateInvoice/${id}`;
    return this.http.put<InvoiceList>(url, invoice).pipe(
      tap((updated) =>
        this.invoiceList.update((list) => {
          const idx = list.findIndex((inv) => inv.id === id);
          if (idx > -1) {
            const copy = [...list];
            copy[idx] = updated;
            return copy;
          }
          return list;
        })
      ),
      map((data) => ({
        success: true,
        data,
        message: 'Invoice updated successfully',
      })),
      catchError(
        (err) =>
          this.errorHandler.handleError(
            err,
            'Failed to update invoice'
          ) as Observable<ApiResponse<InvoiceList>>
      )
    );
  }
  generateDocument(invoice: InvoiceList): Observable<any> {
    const url = `${environment.apiBaseUrl}/invoice/generate`;
    return this.http
      .post(url, invoice, {
        responseType: 'blob',
      })
      .pipe(
        catchError(
          (err) =>
            this.errorHandler.handleError(
              err,
              'Failed to generate invoice document'
            ) as Observable<Blob>
        )
      );
  }

  clearInvoices(): void {
    this.invoiceList.set([]);
  }

  getInvoiceList(): InvoiceList[] {
    return this.invoiceList();
  }
  getInvoiceById(paymentId: number): Observable<InvoiceList> {
    return this.http.get<any>(
      `${environment.apiBaseUrl}/invoice/getInvoiceById`,
      {
        params: new HttpParams().set('paymentId', paymentId.toString()),
      }
    );
  }// checking
}
