import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  retry,
  tap,
  throwError,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { Filler } from 'src/app/models/filer';
import { ErrorHandlerUtil } from 'src/app/shared/error-handler.util';
import {  EinCompany } from 'src/app/models/filer';

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  statusCounts: Record<string, number>;
}



@Injectable({
  providedIn: 'root',
})
export class FilerService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly jsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  // in-memory streams
  private fillersData = new BehaviorSubject<Filler[]>([]);
  readonly fillers$ = this.fillersData.asObservable();

  private currentProgress = new BehaviorSubject<any>(null);
  readonly currentProgress$ = this.currentProgress.asObservable();

  // Required properties
  // pageCache = new Map<string, PagedResponse<Filler>>();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerUtil
  ) {}

  /** Build a full URL from the base + path */
  private url(path: string): string {
    return `${this.baseUrl}/${path}`;
  }

  /** 1) Load the table of companies */

// after:
fetchFillersFromApi(
  page: number,
  size: number,
  status?: string,
  state?: string,
  companyName?: string
): Observable<PagedResponse<Filler>> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  if (status)     params = params.set('status', status);
  if (state)      params = params.set('state', state);
  if (companyName) params = params.set('companyName', companyName);

  return this.http
    .get<PagedResponse<any>>(this.url('company/getCompanyStatusPaged'), { params })
    .pipe(
      retry(2),
      map(resp => {
        const counts = resp.statusCounts || {};
        const content = resp.content.map(item => ({
          id:       item.companyId,
          company:  item.companyName,
          state:    item.state,
          status:   item.status,
          date:     item.date,
          isExpeditedServiceSelected: item.isExpeditedServiceSelected,
          isEinSelected:item.isEinSelected
        }));
        return { ...resp, content, statusCounts: counts } as PagedResponse<Filler>;
      }),
      catchError(err =>
        this.errorHandler.handleError(err, 'Failed to load filler details.')
      )
    );
}

  /** NEW: Fetch EIN status data */
  fetchEinStatusFromApi(
    page: number,
    size: number,
    companyName?: string,
    state?: string
  ): Observable<PagedResponse<EinCompany>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (companyName) params = params.set('companyName', companyName);
    if (state) params = params.set('state', state);

    return this.http
      .get<PagedResponse<any>>(this.url('company/getEinStatusPaged'), { params })
      .pipe(
        retry(2),
        map(resp => {
          const counts = resp.statusCounts || {};
          const content = resp.content.map(item => ({
            companyId: item.companyId,
            companyName: item.companyName,
            
            state: item.state,
            date: item.date,
            isExpeditedServiceSelected: item.isExpeditedServiceSelected,
            viewStatus: item.date !== null && item.date !== undefined
          }));
          return { 
            ...resp, 
            content, 
            statusCounts: counts,
            page: resp.pageNumber // map pageNumber to page for consistency
          } as PagedResponse<EinCompany>;
        }),
        catchError(err =>
          this.errorHandler.handleError(err, 'Failed to load EIN details.')
        )
      );
  }

  /** NEW: Get EIN PDF file */
  getEinFile(companyId: number): Observable<Blob> {
    const params = new HttpParams().set('companyId', companyId.toString());

    return this.http
      .get(this.url('pdf/getEinFile'), {
        params,
        responseType: 'blob'
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Failed to Get EIN File.')
        )
      );
  }

  /** 2) Load the wizard data for one company */
  getUserProgressByCompanyId(companyId: number): Observable<any> {
    const params = new HttpParams().set('companyId', companyId.toString());
    return this.http
      .get<any>(this.url('user-wizard/getUserProgressByCompanyId'), {
        params,
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            'Error Fetching Company Progress.'
          )
        )
      ); // Handle errors here > jef
  }

  /** 3) Keep wizard data in-memory */
  setCurrentProgress(data: any): void {
    this.currentProgress.next(data);
  }



  /** 4) Update only the modified sections of a company */
  updateCompanyData(
    companyId: number,
    data: any,
    isEditing: Record<string, boolean>,
    notes: string,
    loginUserId: number
  ): Observable<string> {
    const payload: any = {};

    // — your existing DTO-building logic unchanged —
    if (isEditing['business'] && data.step1) {
      payload.state = data.step1;
    }

    if (
      isEditing['business'] &&
      (data.step2?.companyName || data.step2?.llcSuffix)
    ) {
      payload.companyRequestDto = {
        companyName: data.step2.companyName,
        llcSuffix: data.step2.llcSuffix || '',
      };
    }
    if (isEditing['business'] && data.step3) {
      payload.formationDate = data.step3;
    }
    if (isEditing['primaryContact'] && data.step5) {
      payload.companyPrimaryContactDto = {
        firstName: data.step5.firstName,
        lastName: data.step5.lastName,
        email: data.step5.email,
        phoneNumber: data.step5.phoneNumber,
      };
    }
    if (isEditing['registeredAgent'] && data.step6) {
      payload.registeredAgentDto = {
        firstName: data.step6.firstName || '',
        lastName: data.step6.lastName || '',
        streetAddress1: data.step6.streetAddress1 || '',
        streetAddress2: data.step6.streetAddress2 || '',
        city: data.step6.city || '',
        state: data.step6.state || '',
        zipCode: data.step6.zipCode || '',
      };
    }
    if (isEditing['managers'] && data.step13a?.length) {
      //13 a
      payload.managerMemberDtoList = data.step13a.map((m: any) => ({
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phoneNumber: m.phoneNumber,
        streetAddress1: m.streetAddress1,
        streetAddress2: m.streetAddress2 || '',
        city: m.city,
        state: m.state,
        zipCode: m.zipCode,
      }));
    }
    if (isEditing['members'] && data.step13b?.length) {
      // 13 b
      payload.memberMemberDtoList = data.step13b.map((m: any) => ({
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phoneNumber: m.phoneNumber,
        streetAddress1: m.streetAddress1,
        streetAddress2: m.streetAddress2 || '',
        city: m.city,
        state: m.state,
        zipCode: m.zipCode,
        country: m.country || '',
        ownership: m.ownership,
      }));
    }
    if (isEditing['businessAddress'] && data.step14) {
      payload.companyMailingAttributesDto = {
        streetAddress1: data.step14.streetAddress1,
        streetAddress2: data.step14.streetAddress2 || '',
        city: data.step14.city,
        zipCode: data.step14.zipCode,
      };
    }
    if (isEditing['state'] && data.step1) {
      payload.state = data.step1;
    }

    console.log('Final Payload for Update:', payload);

    const params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('notes', notes)
      .set('loginUserId', loginUserId.toString());

    return this.http
      .put(this.url('company/update'), payload, {
        headers: this.jsonHeaders,
        params,
        responseType: 'text', // ← picks the overload that returns Observable<string>
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Error Updating Company Data.')
        ) // Handle errors here > jef
      ) as Observable<string>;
  }

  /** 6) Ask backend to generate the PDF (plain text) */
  generateDocument(
    companyId: number,
    state: string,
    filerLoginUserId: number
  ): Observable<string> {
    const params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('state', state)
      .set('filerLoginUserId', filerLoginUserId.toString());

    return this.http
      .get(this.url('pdf/generate'), {
        params,
        responseType: 'text' // Because the swagger shows text response
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Error Generating Document.')
        )
      );
  }

  /** 7) Fetch the PDF blob for view or download */
  getFile(
    companyId: number,
    documentType: string,
    action: 'view' | 'download',
    purpose: string,
    filerLoginUserId: number
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('documentType', documentType)
      .set('action', action)            // e.g. "view" or "download"
      .set('purpose', purpose)          // e.g. "filling"
      .set('filerLoginUserId', filerLoginUserId.toString());

    return this.http
      .get(this.url('pdf/getFile'), {
        params,
        responseType: 'blob'
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Failed to Get File.')
        )
      );
  }

  /** 8) Create a new company filing */
  createCompanyFiling(payload: any): Observable<any> {
    return this.http
      .post<any>(this.url('company-filings/create'), payload, {
        headers: this.jsonHeaders,
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            'Failed to Create Company Filing details.'
          )
        )
      ); // Handle errors here > jef
  }

  /** 9) Fetch filing failure categories */
  getFailureCategories(): Observable<any[]> {
    return this.http
      .get<any[]>(this.url('filing-failure-category/getAllFiling'))
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            'Failed to Get Failure Categories.'
          )
        )
      ); // Handle errors here > jef;
  }

  /** 10) Log a filing failure */
  createFilingFailure(
    companyId: number,
    loginId: number,
    payload: any
  ): Observable<any> {
    const params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('LoginId', loginId.toString());
    return this.http
      .post<any>(this.url('filing-failures/createFiling'), payload, {
        headers: this.jsonHeaders,
        params,
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Failed to Create Filing.')
        )
      ); // Handle errors here > jef;
  }

  /** 11) Fetch document types */
  getDocumentTypes(): Observable<any[]> {
    return this.http
      .get<any[]>(this.url('company/getDocumentTypeList'))
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Failed to Get DocumentsTypes.')
        )
      ); // Handle errors here > jef;
  }

  /** 12) Upload a document file */
 uploadDocument(
    companyId: number,
    documentType: string,
    file: File,
    purpose: string,
    filerLoginUserId: number
  ): Observable<string> {
    // 1) Build FormData for the file field
    const formData = new FormData();
    const ext = file.name.split('.').pop();
    const filename = `${file.name.replace(/\.[^/.]+$/, '')}-${documentType}.${ext}`;
    formData.append('file', file, filename);

    // 2) Build HttpParams including all four query‐fields
    const params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('documentType', documentType)
      .set('purpose', purpose)                          // e.g. "notify_success"
      .set('filerLoginUserId', filerLoginUserId.toString());

    // 3) POST multipart/form-data with those params
    return this.http
      .post(this.url('pdf/upload'), formData, {
        params,
        responseType: 'text',    // Swagger says this endpoint returns text
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, 'Failed to Upload File.')
        )
      );
  }
  // clearCache(): void {
  //   this.pageCache.clear();
  // }
  /** 13) Fetch list of available states */
getStates(): Observable<string[]> {
  return this.http.get<string[]>(this.url('company/states')).pipe(
    catchError((error) =>
      this.errorHandler.handleError(error, 'Failed to load states list.')
    )
  );
}

}