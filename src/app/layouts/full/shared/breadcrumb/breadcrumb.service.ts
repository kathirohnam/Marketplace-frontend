import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppBreadcrumbService {
  private companyDataSubject = new BehaviorSubject<{ companyName: string | null, companyState: string | null }>({
    companyName: null,
    companyState: null,
  });

  private breadcrumbVisibilitySubject = new BehaviorSubject<boolean>(false);

  companyData$ = this.companyDataSubject.asObservable();
  isBreadcrumbVisible$ = this.breadcrumbVisibilitySubject.asObservable();

  // ✅ Update breadcrumb visibility based on the route
  setBreadcrumbVisibility(isVisible: boolean) {
    this.breadcrumbVisibilitySubject.next(isVisible);
  }

  // ✅ Function to update company data
  updateCompanyData(companyName: string, companyState: string) {
    this.companyDataSubject.next({ companyName, companyState });
  }

  // ✅ Clear company data when user navigates away
  clearCompanyData() {
    this.companyDataSubject.next({ companyName: null, companyState: null });
  }

  reset() {
    this.clearCompanyData();
    this.setBreadcrumbVisibility(false);
  }
}
