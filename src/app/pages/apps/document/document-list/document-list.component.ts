import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource, MatTable } from "@angular/material/table";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import {
  DocumentService,
  PagedResponse,
} from "src/app/services/apps/document/document.service";
import { CompanyDialogContentComponent } from "../companyContent-dialog/company-dialog-content.component";
import { DocumentViewerDialogComponent } from "../document-viewer/document-viewer-dialog.component";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { Company, DocumentType } from "src/app/models/document-list";
import { MaterialModule } from "src/app/material.module";
import { FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
import { NgIcon } from "@ng-icons/core";
import { CommonModule } from "@angular/common";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { TokenService } from "src/app/services/token/token.service";
import { LoadingService } from "src/app/services/loading/loading.service";

@Component({
  selector: "app-company",
  templateUrl: "./document-list.component.html",
  styles: [
    `
      @use "src/variables" as *;

      // ==============================================
      // BASE STYLES & DESKTOP LAYOUT (DEFAULT)
      // ==============================================

      // Company Tabs Container
      .company-tab-main {
        margin-bottom: 24px;

        .row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: flex-start;
        }

        .col-sm-6.col-lg-3 {
          flex: 0 0 calc(25% - 16px);
          max-width: calc(25% - 16px);
          display: flex;
        }
      }

      // Company Tab Cards
      .company-tab {
        cursor: pointer;
        padding: 16px 10px 16px 16px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        border-radius: 12px;
        background: #fff;
        border: 2px solid transparent;
        transition: transform 0.3s ease, box-shadow 0.3s ease,
          background 0.3s ease, border-color 0.3s ease;
        flex: 1;
        min-height: 80px;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.12);
          border-color: $primary-color;
          background: #f9f9f9;
        }

        mat-card-content {
          padding: 6px 12px 6px 12px !important;
          width: 100%;
        }

        .icon {
          flex-shrink: 0;
        }

        .info {
          flex: 1;
          min-width: 0;

          h5 {
            margin: 0;
            word-wrap: break-word;
            line-height: 1.2;
          }
        }
      }

      .active-tab {
        background: #f8fafc !important;
        border-color: $primary-color;
      }

      // Search and Actions Card
      .search-actions-card {
        margin-bottom: 24px;

        .search-actions-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-field {
          flex: 1;
          min-width: 250px;
          max-width: 400px;
        }

        .actions-container {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
      }

      // Filters Container
      .state-search-container {
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: 0;
        overflow: hidden;
        opacity: 0;
        transition: max-width 0.3s ease, opacity 0.3s ease;

        &.show-state-search {
          max-width: 420px;
          opacity: 1;
          overflow: visible;
        }

        .document-type-field,
        .state-field {
          min-width: 180px;
        }
      }

      // Action Buttons
      .action-buttons {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .settings-icon {
        transition: transform 0.3s ease-in-out;

        &.active {
          transform: rotate(180deg);
        }
      }

      // Table Styles
      .table-card {
        .table-responsive {
          overflow-x: auto;

          &.disabled {
            opacity: 0.6;
            pointer-events: none;
          }
        }

        .desktop-table {
          min-width: 800px;
        }
      }

      // Mobile Table View (Hidden by default)
      .mobile-table-view {
        display: none;
      }

      // Status Badges
      .status-viewed {
        color: #4caf50;
        font-weight: 500;
      }

      .status-view {
        color: #ff9800;
        font-weight: 500;
      }

      .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;

        &.status-viewed {
          background-color: #e8f5e8;
          color: #2e7d32;
        }

        &.status-view {
          background-color: #fff3e0;
          color: #ef6c00;
        }
      }

      // Empty State
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px;
        color: #666;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
        }
      }

      // ==============================================
      // TABLET RESPONSIVE (768px - 1023px)
      // ==============================================
      @media (max-width: 1023px) and (min-width: 768px) {
        // Company Tabs - 2 per row on tablet
        .company-tab-main {
          .col-sm-6.col-lg-3 {
            flex: 0 0 calc(50% - 10px);
            max-width: calc(50% - 10px);
          }

          .row {
            gap: 16px;
          }
        }

        // Search and Actions
        .search-actions-card {
          .search-actions-container {
            gap: 12px;
          }

          .search-field {
            min-width: 200px;
            max-width: 300px;
          }

          .state-search-container {
            &.show-state-search {
              max-width: 350px;
            }

            .document-type-field,
            .state-field {
              min-width: 160px;
            }
          }
        }
      }

      // ==============================================
      // MOBILE RESPONSIVE (320px - 767px)
      // ==============================================
      @media (max-width: 767px) {
        // Company Tabs - 2 per row on small mobile, 1 on very small
        .company-tab-main {
          margin-bottom: 16px;

          .row {
            gap: 12px;
            margin: 0 -6px;
          }

          .col-sm-6.col-lg-3 {
            flex: 0 0 calc(50% - 6px);
            max-width: calc(50% - 6px);
            padding: 0 6px;
          }
        }

        // Company Tab Cards - Smaller on mobile
        .company-tab {
          padding: 12px 8px;
          margin-bottom: 0;
          min-height: 70px;

          mat-card-content {
            padding: 8px !important;

            .gap-16 {
              gap: 8px !important;
            }
          }

          .icon {
            width: 32px;
            height: 32px;
            min-width: 32px;

            .icon-24 {
              font-size: 18px;
              width: 18px;
              height: 18px;
            }
          }

          .info {
            h5 {
              font-size: 12px !important;
              line-height: 1.1;

              &.f-s-14 {
                font-size: 11px !important;
              }
            }
          }
        }

        // Search and Actions - Stack vertically
        .search-actions-card {
          margin-bottom: 16px;

          .search-actions-container {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .search-field {
            min-width: auto;
            max-width: none;
            width: 100%;
          }

          .actions-container {
            justify-content: space-between;
            width: 100%;
          }
        }

        // Filters Container - Full width when shown
        .state-search-container {
          &.show-state-search {
            max-width: none;
            width: 100%;
            flex-wrap: wrap;
            gap: 12px;
          }

          .document-type-field,
          .state-field {
            flex: 1;
            min-width: 0;
          }
        }

        // Hide desktop table, show mobile cards
        .desktop-table {
          display: none !important;
        }

        .mobile-table-view {
          display: block;
        }

        // Mobile Company Cards
        .mobile-company-card {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 16px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.2s ease;

          &:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }

          &:last-child {
            margin-bottom: 0;
          }
        }

        .mobile-card-header {
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;

          .company-name {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 4px 0;
            color: #333;
            line-height: 1.2;
          }

          .company-jurisdiction {
            font-size: 13px;
            color: #666;
            font-weight: 500;
          }
        }

        .mobile-card-body {
          margin-bottom: 16px;

          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 4px 0;

            &:last-child {
              margin-bottom: 0;
            }

            .info-label {
              font-size: 13px;
              color: #666;
              font-weight: 500;
              flex-shrink: 0;
            }

            .info-value {
              font-size: 13px;
              color: #333;
              text-align: right;
              flex: 1;
              margin-left: 12px;
            }
          }
        }

        .mobile-card-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;

          .admin-actions {
            display: flex;
            gap: 8px;

            .action-btn {
              width: 36px;
              height: 36px;
              border-radius: 6px;

              &.edit-btn {
                background-color: #e3f2fd;
                color: #1976d2;

                &:hover {
                  background-color: #bbdefb;
                }
              }

              &.delete-btn {
                background-color: #ffebee;
                color: #d32f2f;

                &:hover {
                  background-color: #ffcdd2;
                }
              }
            }
          }

          .user-actions {
            .view-document-btn {
              padding: 8px 16px;
              font-size: 13px;
              font-weight: 500;
              border-radius: 6px;
              text-transform: none;

              mat-icon {
                font-size: 16px;
                width: 16px;
                height: 16px;
                margin-right: 6px;
              }
            }
          }
        }

        // Mobile Empty State
        .mobile-empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #666;

          mat-icon {
            font-size: 40px;
            width: 40px;
            height: 40px;
            margin-bottom: 12px;
          }

          .empty-message {
            font-size: 14px;
            line-height: 1.4;
          }
        }
      }

      // ==============================================
      // EXTRA SMALL MOBILE (320px - 479px)
      // ==============================================
      @media (max-width: 479px) {
        // Company Tabs - Single column on very small screens
        .company-tab-main {
          .col-sm-6.col-lg-3 {
            flex: 0 0 100%;
            max-width: 100%;
            padding: 0;
          }

          .row {
            gap: 8px;
            margin: 0;
          }
        }

        // Company Tab Cards - Even smaller
        .company-tab {
          padding: 10px;
          min-height: 60px;

          mat-card-content {
            padding: 6px !important;
          }

          .icon {
            width: 28px;
            height: 28px;
            min-width: 28px;

            .icon-24 {
              font-size: 16px;
              width: 16px;
              height: 16px;
            }
          }

          .info {
            h5 {
              font-size: 11px !important;

              &.f-s-14 {
                font-size: 10px !important;
              }
            }
          }
        }

        // Search and Actions - Smaller padding
        .search-actions-card {
          mat-card-content {
            padding: 16px !important;
          }
        }

        // Mobile Cards - Smaller padding
        .mobile-company-card {
          padding: 12px;
          margin-bottom: 12px;
        }

        .mobile-card-header {
          .company-name {
            font-size: 15px;
          }

          .company-jurisdiction {
            font-size: 12px;
          }
        }

        .mobile-card-body {
          .info-row {
            .info-label,
            .info-value {
              font-size: 12px;
            }
          }
        }
      }

      // ==============================================
      // LARGE SCREENS (1200px+)
      // ==============================================
      @media (min-width: 1200px) {
        // Company Tabs - More space on large screens
        .company-tab-main {
          .row {
            gap: 24px;
          }

          .col-sm-6.col-lg-3 {
            flex: 0 0 calc(25% - 18px);
            max-width: calc(25% - 18px);
          }
        }

        // Search and Actions - Better spacing
        .search-actions-card {
          .search-field {
            max-width: 450px;
          }

          .state-search-container {
            &.show-state-search {
              max-width: 480px;
            }

            .document-type-field,
            .state-field {
              min-width: 200px;
            }
          }
        }
      }

      // ==============================================
      // UTILITY CLASSES
      // ==============================================

      // Hide elements responsively
      @media (max-width: 767px) {
        .hide-mobile {
          display: none !important;
        }
      }

      @media (min-width: 768px) {
        .hide-desktop {
          display: none !important;
        }

        .show-mobile-only {
          display: none !important;
        }
      }

      // Responsive text sizes
      .responsive-text {
        @media (max-width: 767px) {
          font-size: 14px !important;
        }

        @media (max-width: 479px) {
          font-size: 13px !important;
        }
      }

      // Responsive spacing
      .responsive-padding {
        @media (max-width: 767px) {
          padding: 12px !important;
        }

        @media (max-width: 479px) {
          padding: 8px !important;
        }
      }
    `,
  ],
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgIcon,
    CommonModule,
  ],
})
export class DocumentListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable) table!: MatTable<Company>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  documentTypeControl = new FormControl("");
  stateControl = new FormControl("");
  filteredStates!: Observable<string[]>;

  documentTypes: DocumentType[] = [];
  states: string[] = [];

  displayedColumns: string[] = [];
  readonly ADMIN_COLUMNS = [
    "companyName",
    "jurisdiction",
    "uploadedOn",
    "type",
    "action",
  ];
  readonly USER_COLUMNS = [
    "companyName",
    "jurisdiction",
    "uploadedOn",
    "type",
    "view",
    "status",
  ];

  dataSource = new MatTableDataSource<Company>([]);
  isLoading = false;
  isAdmin = false;
  activeTab = "All";
  searchValue = "";
  showStateSearch = false;

  // pagination
  totalItems = 0;
  pageIndex = 0;
  pageSize = 5;
  lastPage = false;

  private allCompanies: Company[] = [];

  constructor(
    private dialog: MatDialog,
    private companyService: DocumentService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private snackBarService: SnackBarService,
    private tokenService: TokenService,
    private loadingService: LoadingService
  ) {
    this.filteredStates = this.stateControl.valueChanges.pipe(
      startWith(""),
      map((v) => this._filterStates(v || ""))
    );
  }

  ngOnInit(): void {
    this.loadingService.show("Loading Documents...");
    const role = this.tokenService.getRole();
    this.isAdmin = role === "Admin";
    this.displayedColumns = this.isAdmin
      ? this.ADMIN_COLUMNS
      : this.USER_COLUMNS;
    this.loadStates();
    this.loadDocumentTypes();
    this.loadCachedData();

    this.documentTypeControl.valueChanges.subscribe(() => this.applyFilters());
    this.loadingService.hide();
  }

  ngAfterViewInit(): void {
    this.loadingService.show("Loading Documents...");
    if (this.isAdmin) {
      this.pageIndex = 0;
      this.pageSize = 5;
      this.loadPage();

      this.paginator.page.subscribe((evt: PageEvent) => {
        this.pageIndex = evt.pageIndex;
        this.pageSize = evt.pageSize;
        this.loadPage();
      });
    } else {
      this.dataSource.paginator = this.paginator; // only for non-admin
    }
    this.loadingService.hide();
  }

  private _filterStates(value: string): string[] {
    const filter = value.toLowerCase();
    return this.states.filter((s) => s.toLowerCase().includes(filter));
  }

  loadStates(): void {
    this.companyService.getStates().subscribe({
      next: (s) => (this.states = s),
      error: () => this.snackBarService.showError("Failed to load states"),
    });
  }

  loadDocumentTypes(): void {
    this.companyService.getDocumentTypes().subscribe({
      next: (t) => (this.documentTypes = t),
      error: () =>
        this.snackBarService.showError("Failed to load document types"),
    });
  }
  /** only called when the user picks one of the mat-option values */
  onStateSelected(state: string) {
    this.stateControl.setValue(state);
    this.pageIndex = 0;
    this.loadPage(); // for admin: hits fetchAdminPage
    this.paginator.firstPage(); // reset page
  }

  /** clear both the field and your filter */
  clearState() {
    this.stateControl.setValue("");
    this.pageIndex = 0;
    this.loadPage();
  }

  private loadCachedData(): void {
    if (this.isAdmin) {
      // admin always page from server
    } else {
      this.loadCompanies();
    }
  }

  loadCompanies(): void {
    this.isLoading = true;
    const obs = this.companyService.getUserCompanies(
      localStorage.getItem("login_user_id"),
      true
    );
    obs.subscribe({
      next: (data) => {
        this.allCompanies = data;
        this.updateDataSource(data);
        this.isLoading = false;
      },
    });
  }

  // refreshCompanies(): void {
  //   this.isLoading = true;
  //   const obs = this.companyService.refreshUserCompanies(
  //     localStorage.getItem('login_user_id')
  //   );
  //   obs.subscribe({
  //     next: (data) => {
  //       this.allCompanies = data;
  //       this.updateDataSource(data);
  //       this.isLoading = false;
  //       this.snackBarService.showSuccess('Companies refreshed');
  //     },
  //   });
  // }

  applyFilters(): void {
    if (this.isAdmin) {
      this.pageIndex = 0;
      this.paginator.pageIndex = 0;
      this.loadPage();
    } else {
      this.applyLocalFilters();
    }
  }

  private applyLocalFilters(): void {
    let filtered = this.allCompanies;
    if (this.activeTab !== "All") {
      filtered = filtered.filter((c) => c.type === this.activeTab);
    }
    const state = this.stateControl.value;
    if (state) {
      filtered = filtered.filter(
        (c) => c.jurisdiction.toLowerCase() === state.toLowerCase()
      );
    }
    const doc = this.documentTypeControl.value;
    if (doc) {
      filtered = filtered.filter((c) => c.type === doc);
    }
    if (this.searchValue) {
      const term = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.companyName.toLowerCase().includes(term) ||
          c.jurisdiction.toLowerCase().includes(term) ||
          c.type.toLowerCase().includes(term)
      );
    }
    this.dataSource.data = filtered;
    this.paginator.firstPage();
  }
  onSearch(): void {
    this.searchValue = this.searchValue?.trim() || "";
    this.applyFilters();
  }

  handleTabClick(type: string): void {
    this.activeTab = type;
    this.applyFilters();
  }

  private loadPage(): void {
    this.companyService
      .fetchAdminPage(
        this.pageIndex,
        this.pageSize,
        this.searchValue,
        this.stateControl.value || "",
        this.documentTypeControl.value || ""
      )
      .subscribe((resp: PagedResponse<Company>) => {
        this.dataSource.data = resp.content; // only current page data
        this.totalItems = resp.totalElements;
        this.lastPage = resp.last;

        // Set paginator props correctly
        this.paginator.length = resp.totalElements;
        this.paginator.pageIndex = resp.page;
        this.paginator.pageSize = resp.size;
      });
  }

  countCompaniesByType(type: string): number {
    return this.allCompanies.filter((c) =>
      type === "All" ? true : c.type === type
    ).length;
  }

  private updateDataSource(data: Company[]): void {
    this.applyLocalFilters();
  }

  openAddDialog(): void {
    // include required id property
    this.openDialog("Add", {
      id: 0,
      companyName: "",
      jurisdiction: "",
      uploadedOn: new Date().toISOString(),
      type: "",
      imagePath: "",
    });
  }

  openDialog(action: string, company: Company): void {
    const ref = this.dialog.open(CompanyDialogContentComponent, {
      data: { action, company },
    });
    ref.afterClosed().subscribe((res) => {
      if (res?.event === "Refresh") this.loadPage();
    });
  }

  openDocument(company: Company): void {
    if (!company.companyId) {
      this.snackBarService.showError(
        "Invalid company data. Please refresh and try again.",
        "error"
      );
      return;
    }

    this.isLoading = true;
    this.companyService
      .getFile(company.companyId, company.type, "view")
      .subscribe({
        next: (documentBlob: Blob) => {
          const dialogRef = this.dialog.open(DocumentViewerDialogComponent, {
            data: {
              documentBlob,
              company,
              companyId: company.companyId,
              documentType: company.type,
            },
            autoFocus: false,
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result === "viewed") {
              company.viewStatus = true;
              this.cdr.detectChanges();
            }
            this.isLoading = false;
          });
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
        },
      });
  }

  toggleStateSearch(): void {
    this.showStateSearch = !this.showStateSearch;
  }
  clearFilters(): void {
    this.searchValue = "";
    this.stateControl.setValue("");
    this.documentTypeControl.setValue("");

    this.pageIndex = 0;
    this.paginator.pageIndex = 0;
    this.loadPage();
  }
}
