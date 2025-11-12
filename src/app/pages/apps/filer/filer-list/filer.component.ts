import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { MaterialModule } from "src/app/material.module";
import { NgIcon } from "@ng-icons/core";
import {
  FilerService,
  PagedResponse,
} from "src/app/services/apps/filer/filer.service";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { Filler } from "src/app/models/filer";
import { TokenService } from "src/app/services/token/token.service";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
    selector: "app-filler-list",
    imports: [
        CommonModule,
        MaterialModule,
        NgIcon,
        FormsModule,
        ReactiveFormsModule,
    ],
    templateUrl: "./filer.component.html",
    styleUrls: ["./filer.component.scss"]
})
export class FilerListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable, { static: true }) table!: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  displayedColumns = ["company", "state", "date", "status", "process"];
  dataSource = new MatTableDataSource<any>([]);
  totalCount = 0;
  statusCounts: Record<string, number> = {};
  selectedStatus: string = "saved";
  searchValue = "";

  totalItems = 0;
  pageIndex = 0;
  pageSize = 5;
  lastPage = false;
  allComplete = signal<boolean>(false);
  stateControl = new FormControl("");
  states: string[] = [];
  filteredStates!: Observable<string[]>;
  showStateSearch = false;

  constructor(
    private fillerService: FilerService,
    private snackBarService: SnackBarService,
    private router: Router,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.selectedStatus = "saved";
    this.initializePagination();
    // console.log('TOKEN', this.tokenService.getToken());
    this.filteredStates = this.stateControl.valueChanges.pipe(
      startWith(""),
      map((v) => this._filterStates(v || ""))
    );
    this.loadStates();
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe((evt: PageEvent) => {
      this.pageIndex = evt.pageIndex;
      this.pageSize = evt.pageSize;
      this.loadPaginatorData();
    });
  }

  initializePagination() {
    // this.fillerService.clearCache(); Clear all cached data
    this.pageIndex = 0;
    this.pageSize = 5;
    this.loadPaginatorData(); // Force API call without cache
  }
  private loadStates(): void {
    this.fillerService.getStates().subscribe({
      next: (s) => (this.states = s),
      error: () => this.snackBarService.show("Failed to load states", "Close"),
    });
  }

  private _filterStates(value: string): string[] {
    const filter = value.toLowerCase();
    return this.states.filter((s) => s.toLowerCase().includes(filter));
  }

  private loadPaginatorData(): void {
    // Load the fillers > jef
    if (this.lastPage && this.pageIndex > this.paginator.pageIndex) return;

    this.fillerService
      .fetchFillersFromApi(
        this.pageIndex,
        this.pageSize,
        this.selectedStatus,
        this.stateControl.value || "",
        this.searchValue.trim() || ""
      )
      .subscribe((resp) => {
        this.dataSource.data = resp.content;

        this.totalItems = resp.totalElements;
        this.pageIndex = resp.pageNumber;
        this.pageSize = resp.pageSize;

        // 3) other UI state
        this.lastPage = resp.last;
        this.statusCounts = resp.statusCounts;

        this.updateAllComplete();
      });
  }

  updateAllComplete(): void {
    const data = this.dataSource.data as any[];
    this.allComplete.set(data.length > 0 && data.every((t) => t.completed));
  }

  onKeyup(e: KeyboardEvent) {
    const searchTerm = (e.target as HTMLInputElement).value;
    this.dataSource.filter = searchTerm.trim().toLowerCase(); // Change > jef
  }

  btnCategoryClick(filter: string): void {
    this.selectedStatus = filter;
    this.pageIndex = 0;
    this.loadPaginatorData();
  }
  // New method
  onStateSelected(state: string): void {
    this.stateControl.setValue(state);
    this.pageIndex = 0;
    this.loadPaginatorData();
    this.paginator.firstPage();
  }

  toggleStateSearch(): void {
    this.showStateSearch = !this.showStateSearch;
  }
  clearState(): void {
    this.stateControl.setValue("");
    this.pageIndex = 0;
    this.loadPaginatorData();
  }
  openViewDetails(companyId?: number): void {
    if (!companyId) {
      console.warn("No companyId provided.");
      this.snackBarService.show("No company selected for viewing.", "Close"); // Change > jef
      return;
    }

    // 1) pull status from the table data
    const company = this.dataSource.data.find((r) => r.id === companyId);
    const status = company?.status?.toLowerCase() || "";

    // 2) fetch full progress
    this.fillerService.getUserProgressByCompanyId(companyId).subscribe({
      next: (progress) => {
        // stash in the service
        this.fillerService.setCurrentProgress(progress);

        // 3) compute the initial step based on the table status + progress details
        const step = this.calculateInitialStepIndex(status, progress);

        // 4) navigate with both params
        this.router.navigate(["/apps/filler"], {
          queryParams: { companyId, step },
        });
      },
    });
  }
  onSearch(): void {
    this.pageIndex = 0;
    this.paginator.firstPage();
    this.loadPaginatorData();
  }

  private calculateInitialStepIndex(
    tableStatus: string,
    progress: any
  ): number {
    if (tableStatus === "saved") {
      return 0;
    }
    if (tableStatus === "reviewed") {
      if (Array.isArray(progress.step13a) && progress.step13a.length) {
        return 4;
      }
      if (Array.isArray(progress.step13b) && progress.step13b.length) {
        return 3;
      }
    }
    if (tableStatus === "ready to file") {
      if (Array.isArray(progress.step13a) && progress.step13a.length) {
        return 5;
      }
      if (Array.isArray(progress.step13b) && progress.step13b.length) {
        return 4;
      }
    }
    if (tableStatus === "filed") {
      if (Array.isArray(progress.step13a) && progress.step13a.length) {
        return 6;
      }
      if (Array.isArray(progress.step13b) && progress.step13b.length) {
        return 5;
      }
    }
    return 0;
  }
  clearFilters(): void {
    this.searchValue = "";
    this.stateControl.setValue("");
    this.selectedStatus = "saved";
    this.pageIndex = 0;
    this.paginator.pageIndex = 0;
    this.loadPaginatorData();
  }
}
