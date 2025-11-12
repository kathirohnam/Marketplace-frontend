// src/app/services/business-hub.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
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

export interface BusinessAdminItemDto {
  owner: {
    ownerId: number;
    firstName: string;
    lastName: string;
    personalEmail: string | null;
    contactNumber: string | null;
    createdOn: string;
  };
  business: {
    businessId: number;
    ownerId: number;
    serviceId: number;
    businessName: string;
    serviceDescription: string | null;
    yearsInBusiness: number | null;
    zipCode: string | null;
    businessAddress: string | null;
    websiteUrl: string | null;
    businessLicense: string | null;
    businessEmail: string | null;
    businessHours: string | null;
    city: string | null;
    state: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdOn: string;
    updatedOn: string | null;
    verified?: boolean;
    statusName?: string;
  };
  verified?: boolean;
  statusName?: string;
}

export interface BusinessAdminPageDto {
  content: BusinessAdminItemDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  verifiedCount?: number;
  unverifiedCount?: number;
  totalCount?: number;
}

@Injectable({ providedIn: 'root' })
export class BusinessHubApi {
  private http = inject(HttpClient);

  /** e.g. https://api.clearincorp.com */
  private base = environment.apiBaseUrl?.replace(/\/+$/, '');

  /** CRUD-by-id & images (your existing singular base) */
  private businessBase = `${this.base}/business`;

  /** LIST / SEARCH / ADMIN / VERIFY (plural – fixes 405) */
  private businessesBase = `${this.base}/businesses`;

  // ---------- LIST / SEARCH (plural) ----------
  /** Generic directory search with optional q/zip; uses exact param name `serviceId` */
  searchDirectory(opts: {
    q?: string | null;
    serviceId?: string | null;  // pass route param as string (e.g., "3" or "all")
    zipCode?: string | null;
    page?: number;
    size?: number;
  }): Observable<Page<BusinessDto>> {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 20));

    if (opts.q) params = params.set('q', opts.q);
    if (opts.zipCode) params = params.set('zipCode', opts.zipCode);
    if (opts.serviceId && opts.serviceId !== 'all') {
      // IMPORTANT: correct case `serviceId`
      params = params.set('serviceId', opts.serviceId);
    }

    return this.http.get<Page<BusinessDto>>(`${this.businessesBase}`, { params });
  }

  /** Simple list by service (plural path + correct param) */
  getBusinessesByService(serviceId: string | number, page = 0, size = 50): Observable<Page<BusinessDto>> {
    const params = new HttpParams()
      .set('serviceId', String(serviceId))
      .set('page', String(page))
      .set('size', String(size));
    return this.http.get<Page<BusinessDto>>(`${this.businessesBase}`, { params });
  }

  /** Compatibility with your previous list function – now points to plural path */
  listBusinesses(serviceId?: number, ownerId?: number, page = 0, size = 50): Observable<Page<BusinessDto>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    if (serviceId != null) params = params.set('serviceId', String(serviceId));
    if (ownerId != null)  params = params.set('ownerId', String(ownerId));
    return this.http.get<Page<BusinessDto>>(`${this.businessesBase}`, { params });
  }

  // ---------- Admin (plural) ----------
  adminList(args: { page: number; size: number; serviceId?: number; zipCode?: string }): Observable<BusinessAdminPageDto> {
    let params = new HttpParams()
      .set('page', String(Math.max(0, args.page)))
      .set('size', String(Math.min(Math.max(args.size, 1), 100)));
    if (args.serviceId != null) params = params.set('serviceId', String(args.serviceId));
    if (args.zipCode) params = params.set('zipCode', args.zipCode);

    return this.http.get<any>(`${this.businessesBase}/admin`, { params }).pipe(
      map((resp: any): BusinessAdminPageDto => {
        const p = resp?.page ?? {};
        return {
          content: p.content ?? [],
          page: p.page ?? p.number ?? 0,
          size: p.size ?? 10,
          totalElements: p.totalElements ?? 0,
          totalPages: p.totalPages ?? 0,
          last: p.last ?? true,
          verifiedCount: resp?.verifiedCount ?? undefined,
          unverifiedCount: resp?.unverifiedCount ?? undefined,
          totalCount: resp?.totalCount ?? undefined,
        };
      })
    );
  }

  /** Toggle verify (pending → verified). Plural path to match admin area. */
  verifyIfPending(businessId: number, loginUserId: number): Observable<void> {
    const params = new HttpParams()
      .set('businessId', String(businessId))
      .set('loginUserId', String(loginUserId));
    return this.http.patch<void>(`${this.businessesBase}/verify`, {}, { params });
  }

  // ---------- NLP (plural) ----------
  searchWeighted(q: string, page = 0, size = 10): Observable<Page<WeightedBusinessHitDto>> {
    const params = new HttpParams().set('q', q).set('page', page).set('size', size);
    return this.http.get<Page<WeightedBusinessHitDto>>(`${this.businessesBase}/nlp`, { params });
  }

  // ---------- CRUD by id (singular) ----------
  createBusiness(dto: BusinessDto): Observable<BusinessDto> {
    return this.http.post<BusinessDto>(`${this.businessBase}`, dto);
  }

  getBusiness(id: number): Observable<BusinessRegistrationDto> {
    const params = new HttpParams().set('id', String(id));
    return this.http.get<BusinessRegistrationDto>(`${this.businessBase}/id`, { params });
  }

  updateBusiness(id: number, dto: BusinessDto): Observable<BusinessDto> {
    return this.http.put<BusinessDto>(`${this.businessBase}/${id}`, dto);
  }

  deleteBusiness(id: number): Observable<void> {
    return this.http.delete<void>(`${this.businessBase}/${id}`);
  }

  // ---------- Images (singular base as you had) ----------
  uploadImages(businessId: number, files: File[] | FileList): Observable<string[]> {
    const form = new FormData();
    form.append('businessId', String(businessId));

    const appendFiles = (f: File[] | FileList) => {
      if (f instanceof FileList) {
        for (let i = 0; i < f.length; i++) form.append('images', f.item(i) as File);
      } else {
        f.forEach(file => form.append('images', file, file.name));
      }
    };
    appendFiles(files);

    const headers = new HttpHeaders(); // let browser set multipart boundary
    return this.http.post<string[]>(`${this.businessBase}/images`, form, { headers });
  }

  /** Returns raw DTOs; useful if the UI needs metadata. */
  listImages(businessId: number): Observable<BusinessImageDto[]> {
    const params = new HttpParams().set('businessId', String(businessId));
    return this.http.get<BusinessImageDto[]>(`${this.businessBase}/images`, { params });
  }

  /** Convenience: just first image URL (null if none). */
  getFirstImage(businessId: number): Observable<string | null> {
    const params = new HttpParams().set('businessId', String(businessId));
    return this.http
      .get<BusinessImageDto[]>(`${this.businessBase}/images`, { params })
      .pipe(map(arr => {
        if (!arr || !arr.length) return null;
        // try url field first; else build from keys if your DTO carries them
        const first = arr[0] as any;
        return first?.url ?? first?.imageUrl ?? null;
      }));
  }

  downloadImage(businessId: number, imageId: number): Observable<Blob> {
    const params = new HttpParams()
      .set('businessId', String(businessId))
      .set('imageId', String(imageId));
    return this.http.get(`${this.businessBase}/image`, { params, responseType: 'blob' });
  }

  deleteImage(businessId: number, imageId: number): Observable<void> {
    const params = new HttpParams()
      .set('businessId', String(businessId))
      .set('imageId', String(imageId));
    return this.http.delete<void>(`${this.businessBase}/image`, { params });
  }

  deleteAllImages(businessId: number): Observable<{ deletedCount: number }> {
    const params = new HttpParams().set('businessId', String(businessId));
    return this.http.delete<{ deletedCount: number }>(`${this.businessBase}/images/all`, { params });
  }

  // ---------- Owners (unchanged) ----------
  createOwner(dto: BusinessOwnerDto): Observable<BusinessOwnerDto> {
    return this.http.post<BusinessOwnerDto>(`${this.base}/business-owners`, dto);
  }

  getOwner(id: number): Observable<BusinessOwnerDto> {
    return this.http.get<BusinessOwnerDto>(`${this.base}/business-owners/${id}`);
  }

  listOwners(): Observable<BusinessOwnerDto[]> {
    return this.http.get<BusinessOwnerDto[]>(`${this.base}/business-owners`);
  }

  getOwnerByEmail(email: string): Observable<BusinessOwnerDto> {
    const params = new HttpParams().set('email', email);
    return this.http.get<BusinessOwnerDto>(`${this.base}/business-owners/email`, { params });
  }

  updateOwner(id: number, dto: BusinessOwnerDto): Observable<BusinessOwnerDto> {
    return this.http.put<BusinessOwnerDto>(`${this.base}/business-owners/${id}`, dto);
  }

  deleteOwner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/business-owners/${id}`);
  }

  // Register owner + business (optional loginUserId)
  registerBusinessOwner(body: BusinessRegistrationDto, loginUserId?: number) {
    let params = new HttpParams();
    if (loginUserId != null) params = params.set('loginUserId', String(loginUserId));
    return this.http.post<BusinessRegistrationDto>(`${this.base}/business-owners/register`, body, { params });
  }

  // ---------- Services / Categories (unchanged) ----------
  listServices(): Observable<ServiceIdName[]> {
    return this.http.get<ServiceIdName[]>(`${this.base}/business-services`);
  }

  getService(id: number): Observable<BusinessServiceDto> {
    return this.http.get<BusinessServiceDto>(`${this.base}/business-services/${id}`);
  }

  createService(dto: BusinessServiceDto): Observable<BusinessServiceDto> {
    return this.http.post<BusinessServiceDto>(`${this.base}/business-services`, dto);
  }

  updateService(id: number, dto: BusinessServiceDto): Observable<BusinessServiceDto> {
    return this.http.put<BusinessServiceDto>(`${this.base}/business-services/${id}`, dto);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/business-services/${id}`);
  }

  // ---------- Helpers for UI VMs ----------
  listCategoriesVM() {
    return this.listServices().pipe(
      map(svcs => svcs.map(s => ({ id: s.serviceId, name: s.serviceName })))
    );
  }
}
