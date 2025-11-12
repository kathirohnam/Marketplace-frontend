import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  SaveResponse,
  PaymentChargesResponse,
  PaymentStatusResponse,
  AgentDetails,
  CompanyCheckResponse,
  CreatePaymentIntentResponse,
  CompanyDetails,
  BusinessDescription,
  EinFormDetails,
} from '../../../models/company-formation';
import { ErrorHandlerUtil } from 'src/app/shared/error-handler.util';

@Injectable({
  providedIn: "root",
})
export class CompanyFormationService {
  private baseUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerUtil
  ) {}

  saveState(data: {
    state: string;
    loginUserId: string;
    companyId?: string;
  }): Observable<SaveResponse> {
    return this.http
      .post<SaveResponse>(`${this.baseUrl}/company/state`, data)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to save state")
        )
      );
  }

  saveFormationDate(
    companyId: number,
    formattedDate: string
  ): Observable<SaveResponse> {
    return this.http
      .post<SaveResponse>(
        `${this.baseUrl}/company/formationdate?company_id=${companyId}&formation_date=${formattedDate}`,
        {}
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to save formation date")
        )
      );
  }

  saveFormationDetails(payload: BusinessDescription): Observable<SaveResponse> {
    const url = `${this.baseUrl}/company/description`;
    return this.http
      .post<SaveResponse>(url, payload)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to save formation details"
          )
        )
      );
  }

  saveCompanyName(
    companyId: number,
    companyData: any
  ): Observable<SaveResponse> {
    return this.http
      .post<SaveResponse>(
        `${this.baseUrl}/company/name?company_id=${companyId}`,
        companyData
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to save company name")
        )
      );
  }

  savePrimaryContact(
    companyId: number,
    contactData: any
  ): Observable<SaveResponse> {
    return this.http
      .post<SaveResponse>(
        `${this.baseUrl}/company/contactdetails?company_id=${companyId}`,
        contactData
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to save primary contact details"
          )
        )
      );
  }

  saveRegisteredAgent(
    companyId: number,
    agentData: any,
    isOurs: boolean
  ): Observable<SaveResponse> {
    const params = new HttpParams()
      .set("company_id", companyId.toString())
      .set("isOurs", isOurs.toString());

    return this.http
      .post<SaveResponse>(`${this.baseUrl}/agent/addNewAgent`, agentData, {
        params,
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to save registered agent details"
          )
        )
      );
  }

  saveEinService(
    companyId: number,
    einRequired: boolean
  ): Observable<SaveResponse> {
    return this.http
      .post<SaveResponse>(
        `${this.baseUrl}/service/ein?company_id=${companyId}&einRequired=${einRequired}`,
        {}
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to save EIN service")
        )
      );
  }

  saveOperatingAgreementService(
    companyId: number,
    oaRequired: boolean
  ): Observable<SaveResponse> {
    return this.http
      .post<SaveResponse>(
        `${this.baseUrl}/service/operatingAggrement?company_id=${companyId}&operatingaggrementRequired=${oaRequired}`,
        {}
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to save operating agreement service"
          )
        )
      );
  }

  saveExpediteService(
    companyId: number,
    expediteRequired: boolean
  ): Observable<SaveResponse> {
    return this.http
      .post<SaveResponse>(
        `${this.baseUrl}/service/expedict?company_id=${companyId}&expedictRequired=${expediteRequired}`,
        {}
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to save expedite service"
          )
        )
      );
  }

  createPaymentIntent(
    amount: number,
    name: string,
    email: string
  ): Observable<CreatePaymentIntentResponse> {
    const url = `${this.baseUrl}/payment/create-payment-intent`;
    return this.http
      .post<CreatePaymentIntentResponse>(url, { amount, name, email })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to create payment intent"
          )
        )
      );
  }

  savePaymentData(paymentData: any, companyId: number): Observable<any> {
    const url = `${this.baseUrl}/payment/stripe?companyId=${companyId}`;
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http
      .post<any>(url, JSON.stringify(paymentData), { headers })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to save payment data")
        )
      );
  }

  updateRegForm2(status: boolean, companyId: number): Observable<any> {
    const url = `${this.baseUrl}/company/regForm2?regForm2=${status}&company_id=${companyId}`;
    return this.http
      .post<any>(url, {})
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to update regForm2")
        )
      );
  }

  checkPaymentStatus(
    paymentIntentId: string
  ): Observable<PaymentStatusResponse> {
    const url = `${this.baseUrl}/payment-status?payment_intent=${paymentIntentId}`;
    return this.http
      .get<PaymentStatusResponse>(url)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to check payment status")
        )
      );
  }
  saveManagementStyle(
    companyId: number,
    managementStyle: "member" | "manager"
  ): Observable<SaveResponse> {
    const params = new HttpParams()
      .set("managementStyle", managementStyle)
      .set("company_id", companyId.toString());

    return this.http
      .post<SaveResponse>(
        `${this.baseUrl}/company/managementStyle`,
        {},
        { params }
      )
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to save management style"
          )
        )
      );
  }
  saveManagerData(
    companyId: number,
    managerData: any[]
  ): Observable<{ message: string; company_id?: string }> {
    const url = `${this.baseUrl}/manager-member/saveManagers?company_id=${companyId}`;
    return this.http
      .post<{ message: string; company_id?: string }>(url, managerData)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to save manager data")
        )
      );
  }

  saveMemberData(
    companyId: number,
    memberData: any[]
  ): Observable<{ message: string; company_id?: string }> {
    const url = `${this.baseUrl}/manager-member/saveMembers?company_id=${companyId}`;
    return this.http
      .post<{ message: string; company_id?: string }>(url, memberData)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to save member data")
        )
      );
  }

  deleteManager(
    companyId: number
  ): Observable<{ message: string; company_id?: string }> {
    const url = `${this.baseUrl}/manager-member/deleteManagers?company_id=${companyId}`;
    return this.http
      .delete<{ message: string; company_id?: string }>(url, {})
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to delete manager service"
          )
        )
      );
  }

  saveMailingAttributes(
    companyId: number,
    mailingData: any
  ): Observable<{ message: string; company_id?: string }> {
    const url = `${this.baseUrl}/company/MailingAttributes?company_id=${companyId}`;
    return this.http
      .post<{ message: string; company_id?: string }>(url, mailingData)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to save mailing attributes"
          )
        )
      );
  }

  checkCompanyName(
    state: string,
    companyName: string
  ): Observable<CompanyCheckResponse> {
    const params = new HttpParams()
      .set("state", state)
      .set("companyName", companyName);
    const headers = new HttpHeaders().set("X-Skip-Loading", "true");
    return this.http
      .get<CompanyCheckResponse>(`${this.baseUrl}/entity/check`, {
        params,
        headers,
      })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to check company name availability"
          )
        )
      );
  }

  getStates(): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.baseUrl}/company/states`)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to load states")
        )
      );
  }

  getLLCSuffixes(): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.baseUrl}/company/suffix`)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to load LLC suffixes.")
        )
      );
  }

  getAgentDetails(stateValue: string): Observable<AgentDetails> {
    return this.http
      .get<AgentDetails>(`${this.baseUrl}/agent/getAgents/${stateValue}`)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to fetch agent details")
        )
      );
  }

  getReasonForApplying(): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.baseUrl}/reasonForApplying/getAll`)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to fetch Reason for Applying"
          )
        )
      );
  }

  getPrincipalActivities(): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.baseUrl}/principal-activities/values`)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to fetch Reason for Applying"
          )
        )
      );
  }
// Accepts the raw control value (string or {id,value} or null) and normalizes it
getPrincipalSubCategories(
  value: string | { id?: number; value?: string } | null | undefined
): Observable<string[]> {
  const resolved = typeof value === 'string' ? value : (value?.value ?? '');

  const url = `${this.baseUrl}/principal-activities/sub-category`;
  const params = new HttpParams().set('value', resolved.trim());

  return this.http
    .get<string[]>(url, { params })
    .pipe(
      catchError((error) =>
        this.errorHandler.handleError(
          error,
          'Failed to fetch principal sub-categories'
        )
      )
    );
}


  // company-formation.service.ts

  updateRegForm(
    formType: "regForm1" | "regForm3" | "regForm4",
    status: boolean,
    companyId: number,
    einChosen?: boolean // used only for regForm3
  ): Observable<void> {
    let params = new HttpParams()
      .set(formType, status.toString())
      .set("company_id", companyId.toString());

    // Add einChosen ONLY for /regForm3
    if (formType === "regForm3" && typeof einChosen === "boolean") {
      params = params.set("einChosen", einChosen);
    }

    const body = {
      createdOn: new Date().toISOString(),
    };

    return this.http
      .post<void>(`${this.baseUrl}/company/${formType}`, body, { params })
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, `Failed to update ${formType}`)
        )
      );
  }

  getPaymentCharges(companyId: number): Observable<PaymentChargesResponse> {
    const url = `${this.baseUrl}/payment/charges?company_id=${companyId}`;
    return this.http
      .get<PaymentChargesResponse>(url)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(
            error,
            "Failed to fetch payment charges"
          )
        )
      );
  }
  getUserProgressByCompanyId(companyId: number): Observable<CompanyDetails> {
    const url = `${this.baseUrl}/user-wizard/getUserProgressByCompanyId
?companyId=${companyId}`;
    return this.http
      .get<CompanyDetails>(url)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Company details not found.")
        )
      );
  }
  getTerms(formType: string) {
    const params = new HttpParams().set("formType", formType);
    return this.http.get<{ formType: string; content: string }>(
      `${this.baseUrl}/terms/getTermsByFormType`,
      { params }
    );
  }
  saveEinDetails(payload: EinFormDetails): Observable<SaveResponse> {
    const url = `${this.baseUrl}/company/saveEinDetails`;
    return this.http
      .post<SaveResponse>(url, payload)
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, "Failed to save EIN details")
        )
      );
  }
}

