import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ConsumerElement, ApiConsumer } from 'src/app/models/consumer';
import { ErrorHandlerUtil } from 'src/app/shared/error-handler.util';

/**
 * Service to handle consumer-related API operations
 */
@Injectable({
  providedIn: 'root',
})
export class ConsumerService {
  private readonly baseUrl = `${environment.apiBaseUrl}/consumer`;
  private readonly vendorId = sessionStorage.getItem('login_user_id') ?? '';

  constructor(
    private readonly http: HttpClient,
    private errorHandler: ErrorHandlerUtil
  ) {}

  getConsumers(): Observable<ConsumerElement[]> {
    const params = new HttpParams().set('loginUserId', this.vendorId);
    return this.http
      .get<ApiConsumer[]>(`${this.baseUrl}/getAllConsumers`, { params })
      .pipe(
        shareReplay(1),
        map((apiList) =>
          apiList.map((c) => ({
            id: c.loginUserId,
            email: c.email,
            firstName: c.firstName,
            lastName: c.lastName,
            phoneNumber: c.phoneNumber,
            role: c.roleId.id === 2 ? 'Consumer' : 'Unknown',
            userCompanyId: { id: c.userCompanyId.id },
          }))
        ),
        catchError((error) =>
          this.errorHandler.handleError(error, 'Error loading consumers')
        )
      );
  }

  /**
   * Retrieves a single consumer by ID
   */
  getConsumerById(id: number): Observable<ConsumerElement | null> {
    return this.getConsumers().pipe(
      map((list) => list.find((c) => c.id === id) || null)
    );
  }

  /**
   * Creates a new consumer
   */
  saveConsumer(payload: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    roleId: { id: number };
    deleted: boolean;
    isActive: boolean;
  }): Observable<void> {
    const params = new HttpParams().set('loginUserId', this.vendorId);
    return this.http
      .post<void>(`${this.baseUrl}/saveConsumer`, payload, { params })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Error saving consumer')
        )
      );
  }

  /**
   * Updates an existing consumer
   */
  updateConsumer(payload: {
    loginUserId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    roleId: { id: number };
    userCompanyId: { id: number };
    deleted: boolean;
    isActive: boolean;
  }): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/updateConsumer`, payload)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Error updating consumer')
        )
      );
  }

  /**
   * Deletes a consumer by ID
   */
  deleteConsumer(id: number): Observable<void> {
    const params = new HttpParams().set('id', id.toString());
    return this.http
      .delete<void>(`${this.baseUrl}/deleteConsumer`, { params })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Error deleting consumer')
        )
      );
  }
}