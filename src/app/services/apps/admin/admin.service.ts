
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AdminElement, VendorResponse, LoginUserDto } from 'src/app/models/admin';
import { ErrorHandlerUtil } from 'src/app/shared/error-handler.util';
import { shareReplay } from 'rxjs/operators';


const createVendorPayload = (
  admin: AdminElement,
  isUpdate: boolean,
  userCompanyId?: number
) => ({
  loginUserDto: {
    loginUserId: isUpdate ? admin.id : undefined,
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    phoneNumber: admin.phone,
    roleId: { id: 4 },
    userCompanyId:
      isUpdate && userCompanyId ? { id: userCompanyId } : undefined,
    createdOn: admin.createdOn || new Date().toISOString(),
    createdBy: admin.createdBy || 'admin_user',
    isActive: admin.isActive ?? true,
    deleted: false,
  },
  userCompanyDto: {
    id: isUpdate ? userCompanyId : undefined,
    name: admin.vendorName || '',
    ein: admin.ein || '',
    phoneNumber: admin.vendorContactNumber || '',
    email: admin.vendor_email || '',
    address: admin.address || '',
    city: admin.city || '',
    state: admin.state || '',
    country: admin.country || '',
    zipCode: admin.zip || '',
    isDeleted: false,
    addBy: admin.createdBy || 'admin_user',
    addDate: admin.createdOn || new Date().toISOString(),
    lastModBy: 'admin_user',
    lastModDate: new Date().toISOString(),
  },
});

const createSuperFilerPayload = (
  admin: AdminElement,
  isUpdate: boolean,
  userCompanyId?: number
) => ({
  loginUserId: isUpdate ? admin.id : undefined,
  firstName: admin.firstName,
  lastName: admin.lastName,
  email: admin.email,
  phoneNumber: admin.phone,
  roleId: { id: 3 },
  userCompanyId: userCompanyId ? { id: userCompanyId } : null,
  createdOn: admin.createdOn || new Date().toISOString(),
  createdBy: admin.createdBy || 'admin_user',
  isActive: admin.isActive ?? true,
  deleted: false,
});

@Injectable({ providedIn: 'root' })
export class AdminService {
  private vendorBase = `${environment.apiBaseUrl}/vendor`;
  private superBase = `${environment.apiBaseUrl}/superfiler`;
  private _cache: AdminElement[] = [];
  private adminsRequest$: Observable<AdminElement[]> | null = null;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerUtil
  ) {}

  getAdmins(): Observable<AdminElement[]> {
    this.adminsRequest$ = forkJoin([
      this.http.get<VendorResponse[]>(`${this.vendorBase}/findAllVendor`),
      this.http.get<LoginUserDto[]>(`${this.superBase}/getAllSuperFiler`),
    ]).pipe(
      map(([vendors, supers]) => {
        const vendorElements: AdminElement[] = vendors.map(
          (v) =>
            ({
              id: v.loginUserDto.loginUserId,
              firstName: v.loginUserDto.firstName || '',
              lastName: v.loginUserDto.lastName || '',
              email: v.loginUserDto.email,
              phone: v.loginUserDto.phoneNumber || '',
              role: v.loginUserDto.roleId.name || 'Vendor',
              ein: v.userCompanyDto?.ein || '',
              vendorName: v.userCompanyDto?.name || '',
              alternativeName: '',
              vendorContactNumber: v.userCompanyDto?.phoneNumber || '',
              vendor_email: v.userCompanyDto?.email || '',
              address: v.userCompanyDto?.address || '',
              city: v.userCompanyDto?.city || '',
              state: v.userCompanyDto?.state || '',
              country: v.userCompanyDto?.country || '',
              zip: v.userCompanyDto?.zipCode || '',
              userCompanyId: v.userCompanyDto?.id,
              createdOn: v.loginUserDto.createdOn,
              createdBy: v.loginUserDto.createdBy,
              isActive: v.loginUserDto.isActive,
            } as AdminElement)
        );

        const superElements: AdminElement[] = supers.map(
          (s) =>
            ({
              id: s.loginUserId,
              firstName: s.firstName || '',
              lastName: s.lastName || '',
              email: s.email,
              phone: s.phoneNumber || '',
              role: s.roleId.name?.replace(/\s+/g, '') || 'SuperFiler',
              userCompanyId: s.userCompanyId?.id,
              createdOn: s.createdOn,
              createdBy: s.createdBy,
              isActive: s.isActive,
            } as AdminElement)
        );

        return [...vendorElements, ...superElements];
      }),
      tap((list) => (this._cache = list)),
      catchError((err) =>
        this.errorHandler.handleError(err, 'Failed to load Users')
      ),
      shareReplay(1)
    );

    return this.adminsRequest$;
  }

  /** Synchronous lookup from cache */
  getCachedAdminById(id: number): AdminElement | undefined {
    return this._cache.find((a: AdminElement) => a.id === id);
  }

  /** Clear the cache */
  clearCache(): void {
    this._cache = [];
  }

  getAdminById(id: number): Observable<AdminElement | undefined> {
    return this.getAdmins().pipe(map((list) => list.find((a) => a.id === id)));
  }

  addAdmin(admin: AdminElement): Observable<any> {
    const payload =
      admin.role === 'Vendor'
        ? createVendorPayload(admin, false)
        : createSuperFilerPayload(admin, false);
    const url =
      admin.role === 'Vendor'
        ? `${this.vendorBase}/saveVendor`
        : `${this.superBase}/saveSuperFiler`;
    return this.http
      .post(url, payload)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Failed to save user')
        )
      );
  }

  updateAdmin(admin: AdminElement): Observable<any> {
    const payload =
      admin.role === 'Vendor'
        ? createVendorPayload(admin, true, admin.userCompanyId)
        : createSuperFilerPayload(admin, true, admin.userCompanyId);
    const url =
      admin.role === 'Vendor'
        ? `${this.vendorBase}/updateVendor`
        : `${this.superBase}/updateSuperFiler`;
    return this.http
      .put(url, payload)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Failed to update user')
        )
      );
  }

  deleteAdmin(id: number, role: string): Observable<any> {
    const params = new HttpParams().set(
      role === 'Vendor' ? 'loginuserId' : 'id',
      id.toString()
    );
    const url =
      role === 'Vendor'
        ? `${this.vendorBase}/deleteVendor`
        : `${this.superBase}/deleteSuperFiler`;
    console.log(
      '[AdminService] Sending DELETE request to:',
      `${url}?${role === 'Vendor' ? 'loginuserId' : 'id'}=${id}`
    );
    return this.http
      .delete(url, { params })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            `Failed to delete ${role.toLowerCase()}`
          )
        )
      );
  }
}
