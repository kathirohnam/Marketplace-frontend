// services/business-hub.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  AuditClickRequestDto,
  AuditClickResponseDto,
  AuditClickStatsDto,
  BusinessDto,
  BusinessImageDto,
  BusinessOwnerDto,
  BusinessRegistrationDto,
  BusinessServiceDto,
  Page,
  ServiceIdName,
  WeightedBusinessHitDto,
} from '../models/business-backend';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BusinessHubApi {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  // ---------- Businesses ----------
  createBusiness(dto: BusinessDto): Observable<BusinessDto> {
    return this.http.post<BusinessDto>(`${this.base}/businesses`, dto);
  }

  getBusiness(id: number): Observable<BusinessDto> {
    const params = new HttpParams().set('id', id);
    return this.http.get<BusinessDto>(`${this.base}/businesses/${id}`, { params });
  }

  listBusinesses(serviceId?: number, ownerId?: number): Observable<BusinessDto[]> {
    let p = new HttpParams();
    if (serviceId != null) p = p.set('serviceId', serviceId);
    if (ownerId != null)  p = p.set('ownerId', ownerId);
    return this.http.get<BusinessDto[]>(`${this.base}/businesses`, { params: p });
  }

  updateBusiness(id: number, dto: BusinessDto): Observable<BusinessDto> {
    const params = new HttpParams().set('id', id);
    return this.http.put<BusinessDto>(`${this.base}/businesses/${id}`, dto, { params });
  }

  deleteBusiness(id: number): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(`${this.base}/businesses/${id}`, { params });
  }

  searchWeighted(q: string, page = 0, size = 10): Observable<Page<WeightedBusinessHitDto>> {
    const params = new HttpParams().set('q', q).set('page', page).set('size', size);
    return this.http.get<Page<WeightedBusinessHitDto>>(`${this.base}/businesses/nlp`, { params });
  }

  getBusinessesByAdmin(serviceId?: number, zipCode?: string, page = 0, size = 10) {
    let p = new HttpParams().set('page', page).set('size', size);
    if (serviceId != null) p = p.set('serviceId', serviceId);
    if (zipCode)         p = p.set('zipCode', zipCode);
    return this.http.get<Page<BusinessRegistrationDto>>(`${this.base}/businesses/by-admin`, { params: p });
  }

  verifyIfPending(businessId: number, loginUserId: number): Observable<void> {
    const params = new HttpParams().set('businessId', businessId).set('loginUserId', loginUserId);
    return this.http.patch<void>(`${this.base}/businesses/verify`, null, { params });
  }

  // ---------- Audit Clicks ----------
  trackClick(body: AuditClickRequestDto): Observable<AuditClickResponseDto> {
    return this.http.post<AuditClickResponseDto>(`${this.base}/businesses/audit-clicks`, body);
  }
  clickStats(businessId: number): Observable<AuditClickStatsDto> {
    const params = new HttpParams().set('businessId', businessId);
    return this.http.get<AuditClickStatsDto>(`${this.base}/businesses/stats`, { params });
  }

  // ---------- Images ----------
  uploadImages(businessId: number, files: File[]): Observable<string[]> {
    const form = new FormData();
    form.append('businessId', String(businessId));
    files.forEach(f => form.append('images', f, f.name));
    return this.http.post<string[]>(`${this.base}/business/images`, form);
  }

  listImages(businessId: number): Observable<BusinessImageDto[]> {
    const params = new HttpParams().set('businessId', businessId);
    return this.http.get<BusinessImageDto[]>(`${this.base}/business/images`, { params });
  }

  downloadImage(businessId: number, imageId: number): Observable<Blob> {
    const params = new HttpParams().set('businessId', businessId).set('imageId', imageId);
    return this.http.get(`${this.base}/business/image`, { params, responseType: 'blob' });
  }

  deleteImage(businessId: number, imageId: number): Observable<void> {
    const params = new HttpParams().set('businessId', businessId).set('imageId', imageId);
    return this.http.delete<void>(`${this.base}/business/image`, { params });
  }

  deleteAllImages(businessId: number): Observable<{ deletedCount: number }> {
    const params = new HttpParams().set('businessId', businessId);
    return this.http.delete<{ deletedCount: number }>(`${this.base}/business/images/all`, { params });
  }

  // ---------- Owners ----------
  createOwner(dto: BusinessOwnerDto) {
    return this.http.post<BusinessOwnerDto>(`${this.base}/business-owners`, dto);
  }
  getOwner(id: number) {
    const params = new HttpParams().set('id', id);
    return this.http.get<BusinessOwnerDto>(`${this.base}/business-owners/${id}`, { params });
  }
  listOwners() {
    return this.http.get<BusinessOwnerDto[]>(`${this.base}/business-owners`);
  }
  getOwnerByEmail(email: string) {
    const params = new HttpParams().set('email', email);
    return this.http.get(`${this.base}/business-owners/email`, { params });
  }
  updateOwner(id: number, dto: BusinessOwnerDto) {
    const params = new HttpParams().set('id', id);
    return this.http.put<BusinessOwnerDto>(`${this.base}/business-owners/${id}`, dto, { params });
  }
  deleteOwner(id: number) {
    return this.http.delete<void>(`${this.base}/business-owners/${id}`);
  }

  // ---------- Services (Categories) ----------
  listServices(): Observable<ServiceIdName[]> {
    return this.http.get<ServiceIdName[]>(`${this.base}/business-services`);
  }
  getService(id: number) {
    const params = new HttpParams().set('id', id);
    return this.http.get<BusinessServiceDto>(`${this.base}/business-services/${id}`, { params });
  }
  createService(dto: BusinessServiceDto) {
    return this.http.post<BusinessServiceDto>(`${this.base}/business-services`, dto);
  }
  updateService(id: number, dto: BusinessServiceDto) {
    const params = new HttpParams().set('id', id);
    return this.http.put<BusinessServiceDto>(`${this.base}/business-services/${id}`, dto, { params });
  }
  deleteService(id: number) {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(`${this.base}/business-services/${id}`, { params });
  }
  // Register owner + business (optional loginUserId)
  registerBusinessOwner(body: BusinessRegistrationDto, loginUserId?: number) {
    let params = new HttpParams();
    if (loginUserId != null) params = params.set('loginUserId', loginUserId);
    return this.http.post<BusinessRegistrationDto>(`${this.base}/business-owners/register`, body, { params });
  }


  // Helpers
  listCategoriesVM() {
    return this.listServices().pipe(
      map(svcs => svcs.map(s => ({ id: s.serviceId, name: s.serviceName })))
    );
  }
}
