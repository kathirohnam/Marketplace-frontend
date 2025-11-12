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
  FilerService,
  PagedResponse,
} from "src/app/services/apps/filer/filer.service";
import { EinCompany } from "src/app/models/filer";

import { EinDetailsViewComponent } from "../ein-details-view/ein-details-view.component";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { MaterialModule } from "src/app/material.module";
import { FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
import { NgIcon } from "@ng-icons/core";
import { CommonModule } from "@angular/common";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
  selector: "app-ein-details-list",
  templateUrl: "./ein-details-list.component.html",
  styles: [
    `
      /* Container for both filters */
      .state-search-container {
        display: flex;
        align-items: center;
        gap: 8px; // space between the two fields
        max-width: 0; // start collapsed
        overflow: hidden;
        opacity: 0;
        transition: max-width 0.3s ease, opacity 0.3s ease;

        &.show-state-search {
          max-width: 420px; // ~ 200px + 200px + 8px gap + padding if any
          opacity: 1;
          overflow: visible;
        }
      }

      /* If you still need the search-field transition from before */
      .search-field {
        transition: opacity 0.2s ease-in-out;
        opacity: 1;
      }

      /* Mobile tweaks */
      @media (max-width: 768px) {
        .state-search-container.show-state-search {
          max-width: 300px; // shrink for smaller screens
        }

        .search-field {
          margin-bottom: 16px;
        }
      }

      /* Rotate icon when active */
      .settings-icon {
        transition: transform 0.3s ease-in-out;

        &.active {
          transform: rotate(180deg);
        }
      }

      .status-viewed {
        color: #4caf50;
        font-weight: 500;
      }

      .status-not-viewed {
        color: #ff9800;
        font-weight: 500;
      }
    `,
  ],
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgIcon,
    CommonModule,
  ],
})
export class EinDetailsListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable) table!: MatTable<EinCompany>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  stateControl = new FormControl("");
  filteredStates!: Observable<string[]>;

  states: string[] = [];

  displayedColumns: string[] = ["companyName", "state", "view", "status"];

  dataSource = new MatTableDataSource<EinCompany>([]);
  isLoading = false;
  searchValue = "";
  showStateSearch = false;

  // pagination
  totalItems = 0;
  pageIndex = 0;
  pageSize = 5;
  lastPage = false;

  constructor(
    private dialog: MatDialog,
    private filerService: FilerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private snackBarService: SnackBarService
  ) {
    this.filteredStates = this.stateControl.valueChanges.pipe(
      startWith(""),
      map((v) => this._filterStates(v || ""))
    );
  }

  ngOnInit(): void {
    this.loadStates();
    // this.loadPage();
  }

  ngAfterViewInit(): void {
    this.pageIndex = 0;
    this.pageSize = 5;
    this.loadPage();

    this.paginator.page.subscribe((evt: PageEvent) => {
      this.pageIndex = evt.pageIndex;
      this.pageSize = evt.pageSize;
      this.loadPage();
    });
  }

  private _filterStates(value: string): string[] {
    const filter = value.toLowerCase();
    return this.states.filter((s) => s.toLowerCase().includes(filter));
  }

  loadStates(): void {
    this.filerService.getStates().subscribe({
      next: (s) => (this.states = s),
      error: () => this.snackBarService.showError("Failed to load states"),
    });
  }

  /** only called when the user picks one of the mat-option values */
  onStateSelected(state: string) {
    this.stateControl.setValue(state);
    this.pageIndex = 0;
    this.loadPage();
    this.paginator.firstPage(); // reset page
  }

  /** clear both the field and your filter */
  clearState() {
    this.stateControl.setValue("");
    this.pageIndex = 0;
    this.loadPage();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.paginator.pageIndex = 0;
    this.loadPage();
  }

  onSearch(): void {
    this.searchValue = this.searchValue?.trim() || "";
    this.applyFilters();
  }

  private loadPage(): void {
    this.isLoading = true;
    this.filerService
      .fetchEinStatusFromApi(
        this.pageIndex,
        this.pageSize,
        this.searchValue,
        this.stateControl.value || ""
      )
      .subscribe({
        next: (resp: PagedResponse<EinCompany>) => {
          this.dataSource.data = resp.content;
          this.totalItems = resp.totalElements;
          this.lastPage = resp.last;

          // Set paginator props correctly
          this.paginator.length = resp.totalElements;
          this.paginator.pageIndex = resp.pageNumber;
          this.paginator.pageSize = resp.pageSize;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.snackBarService.showError("Failed to load EIN companies");
        },
      });
  }

  private updateDataSource(data: EinCompany[]): void {
    this.dataSource.data = data;
    this.paginator.firstPage();
  }

  openDocument(company: EinCompany): void {
    if (!company.companyId) {
      this.snackBarService.showError(
        "Invalid company data. Please refresh and try again.",
        "error"
      );
      return;
    }

    this.isLoading = true;
    this.filerService.getEinFile(company.companyId).subscribe({
      next: (documentBlob: Blob) => {
        const dialogRef = this.dialog.open(EinDetailsViewComponent, {
          data: {
            documentBlob,
            company,
            companyId: company.companyId,
            documentType: "EIN",
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
        this.snackBarService.showError("Failed to load EIN document");
      },
    });
  }
  clearFilters(): void {
    this.searchValue = "";
    this.stateControl.setValue("");
    this.pageIndex = 0;
    this.paginator.pageIndex = 0;
    this.loadPage();
  }

  toggleStateSearch(): void {
    this.showStateSearch = !this.showStateSearch;
  }
}
