import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router, NavigationStart, NavigationEnd } from "@angular/router";
import { Subscription, interval } from "rxjs";
import { filter, tap, finalize } from "rxjs/operators";
import { MaterialModule } from "src/app/material.module";
import { CommonModule } from "@angular/common";
import { NgIcon } from "@ng-icons/core";
import { NgScrollbarModule } from "ngx-scrollbar";
import { DashboardService } from "src/app/services/apps/dashboard/dashboard.service";
import { UserProgress, CompanyDetails } from "src/app/models/dashboard";
import { FormationDetailsDialogComponent } from "./view-FormationDetails/view-FormationDetails.component";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { LoadingService } from "src/app/services/loading/loading.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashBoard.component.html",
  styleUrls: ["./dashBoard.component.scss"],
  imports: [MaterialModule, CommonModule, DragDropModule, NgScrollbarModule],
})
export class DashboardComponent implements OnInit, OnDestroy {
  draftList: UserProgress[] = [];
  progressList: UserProgress[] = [];
  completedProgressList: UserProgress[] = [];
  selectedTabIndex: number = 0;
  selectedCompany: UserProgress | null = null;
  isLoading: boolean = false;
  private hoveredCompany: UserProgress | null = null;

  private pollingSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private userId: number = 0;

  private readonly POLLING_INTERVAL = 30000;
  private readonly STORAGE_KEYS = {
    DRAFT_LIST: "draftList",
    PROGRESS_LIST: "progressList",
    COMPLETED_LIST: "completedProgressList",
    COMPANY_LIST: "Companylist",
    COMPANY_DETAILS: "CompanyDetails",
    COMPANY_DATA: "CompanyData",
    SELECTED_COMPANY: "selectedCompany",
  };

  constructor(
    private taskboardService: DashboardService,
    private router: Router,
    private dialog: MatDialog,
    private SnackBarService: SnackBarService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    sessionStorage.removeItem("managementStyle");
    sessionStorage.removeItem("needEin");
    this.userId = this.getLoggedInUserId();
    this.loadStoredData();
    this.fetchProgress();
    this.initializeRouterEvents();
    history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", () => {
      history.pushState(null, "", window.location.href);
    });
  }

  // ... (All other methods from the previous version remain the same) ...

  // v v v v v  NEW METHOD ADDED HERE  v v v v v
  /**
   * Provides dynamic content for the "In Progress" card based on status.
   * @param status The company's current statusName.
   * @returns An object with stage info for the UI.
   */
  getInProgressInfo(status?: string): {
    stage: number;
    description: string;
    timeline: string;
  } {
    const statusKey = status?.toLowerCase() || "saved"; // Default to 'saved' if status is missing
    const infoMap: {
      [key: string]: { stage: number; description: string; timeline: string };
    } = {
      saved: {
        stage: 1,
        description:
          "We are reviewing your submission for completeness and accuracy before sending it to the state.",
        timeline: "Est. Review Time: 1-2 Business Days",
      },
      reviewed: {
        stage: 2,
        description:
          "Your application has been verified by our team and is prepared for state filing.",
        timeline: "Ready for filing with the state.",
      },
      "ready to file": {
        stage: 2,
        description:
          "Your application is in the queue and will be submitted to the state during the next business hours.",
        timeline: "Filing is imminent.",
      },
      filed: {
        stage: 3,
        description:
          "Your documents have been successfully filed with the state and are now pending their final approval.",
        timeline: "Est. State Approval: 5-7 Business Days",
      },
      failure: {
        stage: 0, // Special case for failure to show no progress
        description:
          "There was an issue with your filing. Please review the details to make corrections and resubmit.",
        timeline: "Action Required",
      },
    };
    return infoMap[statusKey] || infoMap["saved"]; // Fallback to 'saved'
  }
  // ^ ^ ^ ^ ^  END OF NEW METHOD  ^ ^ ^ ^ ^

  // ... (Rest of the methods like getLoggedInUserId, getUsername, fetchProgress, etc., are unchanged) ...
  // NOTE: Ensure all previous methods are still present in your file.
  private getLoggedInUserId(): number {
    return Number(localStorage.getItem("login_user_id")) || 0;
  }

  private getUsername(): string {
    const raw = sessionStorage.getItem("userData");
    if (!raw) {
      return "there";
    }

    try {
      const user = JSON.parse(raw) as { firstName?: string; email?: string };
      if (user.firstName) {
        const firstName = user.firstName.trim();
        return firstName.charAt(0).toUpperCase() + firstName.slice(1);
      }
      return "there";
    } catch {
      return "there";
    }
  }

  private loadStoredData(): void {
    this.draftList = this.getFromStorage(this.STORAGE_KEYS.DRAFT_LIST, []);
    this.progressList = this.getFromStorage(
      this.STORAGE_KEYS.PROGRESS_LIST,
      []
    );
    this.completedProgressList = this.getFromStorage(
      this.STORAGE_KEYS.COMPLETED_LIST,
      []
    );
    this.selectedCompany = this.getFromStorage(
      this.STORAGE_KEYS.SELECTED_COMPANY,
      null
    );
  }

  private getFromStorage<T>(key: string, defaultValue: T): T {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  }

  private saveToStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getWelcomeMessage(): string {
    const username = this.getUsername();
    const totalCompanies =
      this.draftList.length +
      this.progressList.length +
      this.completedProgressList.length;
    const pending = this.draftList.length + this.progressList.length;

    if (totalCompanies === 0) {
      return `Welcome, ${username}!`;
    } else if (pending > 0) {
      return `Welcome back, ${username}!`;
    } else {
      return `Great work, ${username}!`;
    }
  }

  getSubtitleMessage(): string {
    const totalCompanies =
      this.draftList.length +
      this.progressList.length +
      this.completedProgressList.length;
    const pending = this.draftList.length + this.progressList.length;
    const completed = this.completedProgressList.length;

    if (totalCompanies === 0) {
      return "Let's get your business started with a simple LLC formation.";
    } else if (pending > 0 && completed === 0) {
      return `You have ${pending} LLC${
        pending > 1 ? "s" : ""
      } pending. Let's complete your formations!`;
    } else if (pending > 0 && completed > 0) {
      return `Managing ${completed} active LLC${
        completed > 1 ? "s" : ""
      } with ${pending} more pending.`;
    } else {
      return `Successfully managing ${completed} active LLC${
        completed > 1 ? "s" : ""
      }. Ready to start another?`;
    }
  }

  getActiveFormationsCount(): number {
    return this.draftList.length + this.progressList.length;
  }

  getProgressPercentageForCompany(company: UserProgress): number {
    const stepIndex = company.firstIncompleteStepIndex ?? 0;
    const progressMapping: { [key: number]: number } = {
      0: 10,
      1: 25,
      2: 50,
      3: 75,
      4: 100,
    };
    return progressMapping[stepIndex] || 0;
  }

  getDetailedStatus(stepIndex: number | undefined): string {
    if (stepIndex === undefined)
      return "Ready to begin your LLC formation journey";

    const statusMapping: { [key: number]: string } = {
      0: "Getting started with basic information collection",
      1: "Collecting business details and structure preferences",
      2: "Setting up registered agent service for your LLC",
      3: "Processing payment and preparing state filings",
      4: "LLC formation complete - congratulations!",
    };

    return (
      statusMapping[stepIndex] || "Ready to begin your LLC formation journey"
    );
  }

  getNextStepDescription(stepIndex: number | undefined): string {
    if (stepIndex === undefined) return "Provide basic business information";

    const nextStepMapping: { [key: number]: string } = {
      0: "Provide Business Information",
      1: "Boost your LLC with extra services",
      2: "Finalize Your Payment",
      3: "Pick the power that leads your LLC",
      4: "🎉 Formation complete!",
    };

    return nextStepMapping[stepIndex] || "Continue formation process";
  }

  private fetchProgress(): void {
    this.isLoading = true;

    this.taskboardService
      .getUserProgress(this.userId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          if (!Array.isArray(data)) {
            return;
          }

          const previouslySelectedCompanyId = this.selectedCompany?.companyId;

          const drafts: UserProgress[] = [];
          const inProgress: UserProgress[] = [];
          const completed: UserProgress[] = [];

          data.forEach((item) => {
            const progressItem: UserProgress = {
              companyId: item.companyId,
              state: item.state,
              companyName: item.companyName,
              llcName: item.llcName,
              firstIncompleteStepIndex: item.step,
              steps: [],
              statusName: item.statusName,
            };

            const status = item.statusName?.toLowerCase();

            if (status === "success") {
              completed.push(progressItem);
            } else if (item.step !== 4 && item.companyName && item.llcName) {
              drafts.push(progressItem);
            } else if (item.step === 4 && status !== "success") {
              inProgress.push(progressItem);
            }
          });

          this.draftList = drafts;
          this.progressList = inProgress;
          this.completedProgressList = completed;

          this.updateSelectedCompanyWithFreshData(
            previouslySelectedCompanyId,
            data
          );

          this.saveToStorage(this.STORAGE_KEYS.DRAFT_LIST, this.draftList);
          this.saveToStorage(
            this.STORAGE_KEYS.PROGRESS_LIST,
            this.progressList
          );
          this.saveToStorage(
            this.STORAGE_KEYS.COMPLETED_LIST,
            this.completedProgressList
          );
        },
        error: (error) => {
          console.error("Error fetching progress:", error);
          this.draftList = [];
          this.progressList = [];
          this.completedProgressList = [];
          this.initializeFallbackSelectedCompany();
        },
      });
  }

  private updateSelectedCompanyWithFreshData(
    previouslySelectedCompanyId?: number,
    allData?: any[]
  ): void {
    if (previouslySelectedCompanyId) {
      let updatedCompany =
        this.draftList.find(
          (company) => company.companyId === previouslySelectedCompanyId
        ) ||
        this.progressList.find(
          (company) => company.companyId === previouslySelectedCompanyId
        ) ||
        this.completedProgressList.find(
          (company) => company.companyId === previouslySelectedCompanyId
        );

      if (updatedCompany) {
        this.selectedCompany = updatedCompany;
        this.saveToStorage(
          this.STORAGE_KEYS.SELECTED_COMPANY,
          this.selectedCompany
        );
        return;
      }
    }

    this.initializeFallbackSelectedCompany();
  }

  private initializeFallbackSelectedCompany(): void {
    if (!this.selectedCompany) {
      const firstDraft = this.getFirstDraftCompany();
      if (firstDraft) {
        this.selectedCompany = firstDraft;
        this.saveToStorage(
          this.STORAGE_KEYS.SELECTED_COMPANY,
          this.selectedCompany
        );
      }
    }
  }

  getSidebarTitle(): string {
    const company = this.getActiveCompany();
    if (company) {
      const companyName = company.companyName || company.llcName;
      return `${companyName}`;
    }
    return "Your LLC Journey";
  }

  getSidebarSubtitle(): string {
    return this.getActiveCompany()
      ? "Track your formation progress and next steps"
      : "Professional LLC formation made simple";
  }

  getProgressPercentage(): number {
    const company = this.getActiveCompany();
    if (!company) return 0;

    const stepIndex = company.firstIncompleteStepIndex ?? 0;
    const progressMapping: { [key: number]: number } = {
      0: 10,
      1: 25,
      2: 50,
      3: 75,
      4: 100,
    };
    return progressMapping[stepIndex] || 0;
  }

  getProgressStage(): string {
    const company = this.getActiveCompany();
    if (!company) return "Business Details";

    const stepIndex = company.firstIncompleteStepIndex ?? 0;
    const stageMapping: { [key: number]: string } = {
      0: "Business Details",
      1: "Business Structure",
      2: "Registered Agent",
      3: "Payment & Filing",
      4: "LLC Formation Complete",
    };
    return stageMapping[stepIndex] || "Business Details";
  }

  getProgressDescription(): string {
    return this.getProgressStage();
  }

  getFirstDraftCompany(): UserProgress | null {
    const firstDraft = this.draftList.find(
      (company) => company.firstIncompleteStepIndex !== undefined
    );
    return firstDraft || null;
  }

  isSuggestedCompany(company: UserProgress): boolean {
    const currentSidebarCompany =
      this.selectedCompany || this.getFirstDraftCompany();
    return (
      currentSidebarCompany?.companyId === company.companyId &&
      !this.selectedCompany
    );
  }

  isSelectedCompany(company: UserProgress): boolean {
    return this.selectedCompany?.companyId === company.companyId;
  }

  isSelectedCompanyCompleted(): boolean {
    if (!this.selectedCompany) return false;
    return this.completedProgressList.some(
      (company) => company.companyId === this.selectedCompany?.companyId
    );
  }

  getProgressMessage(stepIndex: number | undefined): string {
    if (stepIndex === undefined) return "Ready to Start";
    const messages: { [key: number]: string } = {
      0: "Getting Started",
      1: "Business Setup",
      2: "Agent Registration",
      3: "Payment Completed",
      4: "Formation Complete",
    };
    return messages[stepIndex] || "Ready to Start";
  }

  trackByCompanyId(index: number, item: UserProgress): number {
    return item.companyId || index;
  }

  startWizard(companyId?: number, company?: UserProgress): void {
    this.loadingService.show("Loading company formation progress…");

    if (!companyId) {
      this.loadingService.hide();
      this.router.navigate(["/wizard/forms"], {
        state: { step: 0 },
      });
      return;
    }

    if (company) {
      this.selectedCompany = company;
      this.saveToStorage(
        this.STORAGE_KEYS.SELECTED_COMPANY,
        this.selectedCompany
      );
    }

    this.taskboardService.getUserProgressByCompanyId(companyId).subscribe({
      next: (data) => {
        if (data.managementStyle) {
          sessionStorage.setItem("managementStyle", data.managementStyle);
        }
        sessionStorage.setItem("needEin", String(data.step8));

        this.loadingService.hide();
        const incompleteStep = this.findIncompleteStepIndex(data);

        this.router.navigate(["/wizard/forms"], {
          state: { step: incompleteStep, companyId },
        });
      },
      error: () => {
        this.loadingService.hide();
        this.router.navigate(["/wizard/forms"], {
          state: { step: 0, companyId },
        });
      },
    });
  }

  private findIncompleteStepIndex(item: CompanyDetails): number {
    if (!item.step1) return 0;
    if (!item.step2?.companyName) return 1;
    if (!item.step3) return 2;
    if (!item.step4) return 3;
    if (
      !item.step5 ||
      Object.values(item.step5).some((v) => v === null || v === "")
    )
      return 4;
    if (
      !item.step6 ||
      Object.entries(item.step6).some(
        ([key, v]) =>
          !["streetAddress2", "country", "email", "phoneNumber"].includes(
            key
          ) &&
          (v === null || v === "")
      )
    )
      return 5;
    if (item.step7 !== true) return 6;
    if (
      item.step8 !== true &&
      item.step9 !== true &&
      item.step10 !== true &&
      item.step12 !== true
    )
      return 7;
    if (item.step11?.totalCharges == null) return 7;
    if (item.step12 !== true) return 10;
    if (
      (!item.step13a || item.step13a.length === 0) &&
      (!item.step13b || item.step13b.length === 0)
    )
      return 12;
    if (item.managementStyle === "manager") {
      if (!item.step13a || item.step13a.length === 0) return 13;
      else if (!item.step13b || item.step13b.length === 0) return 14;
    }

    if (item.managementStyle === "member") {
      if (!item.step13b || item.step13b.length === 0) return 13;
    }

    if (
      !item.step14 ||
      Object.values(item.step14).some((v) => v === null || v === "")
    )
      return item.managementStyle === "manager" ? 14 : 13;
    if (item.step15 !== true) return 15;
    if (item.step15 === true && item.step8 === true)
      return item.managementStyle === "manager" ? 17 : 16;
    return 0;
  }

  private startPolling(): void {
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(tap(() => this.fetchProgress()))
      .subscribe();
  }

  private stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
  }

  private initializeRouterEvents(): void {
    this.routerSubscription = this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart || event instanceof NavigationEnd
        ),
        tap((event) => {
          if (event instanceof NavigationStart) {
            this.stopPolling();
          } else if (event instanceof NavigationEnd) {
            if (this.router.url.includes("/dashboard")) {
              this.fetchProgress();
            }
            this.startPolling();
          }
        })
      )
      .subscribe();
  }

  drop(event: CdkDragDrop<UserProgress[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.saveToStorage(this.STORAGE_KEYS.DRAFT_LIST, this.draftList);
    this.saveToStorage(this.STORAGE_KEYS.PROGRESS_LIST, this.progressList);
    this.saveToStorage(
      this.STORAGE_KEYS.COMPLETED_LIST,
      this.completedProgressList
    );
  }

  openViewDetails(companyId?: number): void {
    if (!companyId) {
      return;
    }

    this.taskboardService.getUserProgressByCompanyId(companyId).subscribe({
      next: (data) => {
        const companyDetailsArray = Array.isArray(data) ? data : [data];
        const detailsForCompany = companyDetailsArray.find(
          (item: CompanyDetails) => item.companyId === companyId
        );

        if (detailsForCompany) {
          this.dialog.open(FormationDetailsDialogComponent, {
            autoFocus: false,
            width: "700px",
            data: detailsForCompany,
          });
        } else {
          this.SnackBarService.show("Company details not found.");
        }
      },
      error: () => {
        this.SnackBarService.show(
          "Unable to load company details. Please try again."
        );
      },
    });
  }

  navigateToPages(): void {
    this.loadingService.show("Starting LLC formation wizard…");
    setTimeout(() => {
      this.loadingService.hide();
      this.router.navigate(["/wizard/forms"], { state: { step: 0 } });
    }, 1000);
  }

  accessDocuments(): void {
    this.router.navigate(["/apps/document"]);
  }

  reviewCompliance(): void {
    this.router.navigate(["/apps/invoice"]);
  }

  goToUserProfile(): void {
    this.router.navigate(["/apps/account-settings"]);
  }

  ngOnDestroy(): void {
    window.removeEventListener("popstate", () => {
      history.pushState(null, "", window.location.href);
    });
    this.stopPolling();
    this.routerSubscription?.unsubscribe();
  }
  getStatusDisplayText(status?: string): string {
    const statusMap: { [key: string]: string } = {
      saved: "Under Review",
      reviewed: "Verified",
      "ready to file": "Ready for Filing",
      filed: "Submitted",
      success: "Active LLC",
      failure: "Update Required",
    };
    return statusMap[status?.toLowerCase() || ""] || "Pending";
  }

  getStatusIcon(status?: string): string {
    const iconMap: { [key: string]: string } = {
      saved: "edit",
      reviewed: "visibility",
      "ready to file": "schedule",
      filed: "upload",
      success: "check_circle",
      failure: "error",
    };
    return iconMap[status?.toLowerCase() || ""] || "hourglass_empty";
  }

  getStatusClass(status?: string): string {
    const classMap: { [key: string]: string } = {
      saved: "status-draft",
      reviewed: "status-reviewed",
      "ready to file": "status-ready",
      filed: "status-filed",
      success: "status-success",
      failure: "status-failure",
    };
    return classMap[status?.toLowerCase() || ""] || "status-pending";
  }

  private getActiveCompany(): UserProgress | null {
    return (
      this.hoveredCompany || this.selectedCompany || this.getFirstDraftCompany()
    );
  }

  onHoverCompany(company: UserProgress): void {
    this.hoveredCompany = company;
  }

  onLeaveCompany(): void {
    this.hoveredCompany = null;
  }
  selectCompany(company: UserProgress): void {
    this.selectedCompany = company;
    this.saveToStorage(
      this.STORAGE_KEYS.SELECTED_COMPANY,
      this.selectedCompany
    );
  }
}
