import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { MaterialModule } from "src/app/material.module";
import { NgIcon } from "@ng-icons/core";
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { UserProgress, CompanyDetails } from "src/app/models/dashboard";

import {
  FilerService,
  PagedResponse,
} from "src/app/services/apps/filer/filer.service";
import { Filler } from "src/app/models/filer";
import { SnackBarService } from "src/app/shared/snackbar.service";

import { DashboardService } from "src/app/services/apps/dashboard/dashboard.service";
import { FormationDetailsDialogComponent } from "../../dashboard/view-FormationDetails/view-FormationDetails.component";

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, MaterialModule,  NgIcon,
    FormsModule,
    ReactiveFormsModule,
    NgxExtendedPdfViewerModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,],
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss'],
})
export class CompanyDetailsComponent {
 @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
 
   displayedColumns = ["company", "state", "date", "status", "action"];
   dataSource = new MatTableDataSource<Filler>([]);
   stateControl = new FormControl("");
   states: string[] = [];
   filteredStates!: Observable<string[]>;
   showStateSearch = false;
   searchValue = "";
   // ─── Paging state ─────────────────────────────
   pageIndex = 0;
   pageSize = 5;
   totalItems = 0;
   lastPage = false;
 
   constructor(
     private fillerService: FilerService,
     private snackBarService: SnackBarService,
     private router: Router,
     private dialog: MatDialog,
    private taskboardService: DashboardService,
   ) {}
 
   ngOnInit(): void {
     // No full-list subscription here—paging happens in ngAfterViewInit
     this.filteredStates = this.stateControl.valueChanges.pipe(
       startWith(""),
       map((v) => this._filterStates(v || ""))
     );
     this.loadStates();
   }
 
   ngAfterViewInit(): void {
     // Initial load
     this.loadPage();
 
     // Page change handler
     this.paginator.page.subscribe((evt: PageEvent) => {
       this.pageIndex = evt.pageIndex;
       this.pageSize = evt.pageSize;
       this.loadPage();
     });
   }
 
   /** Load one page of “success” fillers from the API */
   private loadPage(): void {
     this.fillerService
       .fetchFillersFromApi(
         this.pageIndex,
         this.pageSize,
         "",
         this.stateControl.value || "",
         this.searchValue.trim() || ""
       )
       .subscribe((resp: PagedResponse<Filler>) => {
         this.dataSource.data = resp.content;
         console.log(resp.content);
         this.totalItems = resp.totalElements;
         this.paginator.length = resp.totalElements;
         this.paginator.pageIndex = resp.pageNumber;
         this.paginator.pageSize = resp.pageSize;
         this.lastPage = resp.last;
       });
   }
 
   onKeyup(e: KeyboardEvent): void {
     const v = (e.target as HTMLInputElement).value.trim().toLowerCase();
     this.dataSource.filter = v;
   }
 
   /** Count how many on this page have the given status */
   countFillersByStatus(status: string): number {
     return this.dataSource.data.filter(
       (f) => f.status.toLowerCase() === status.toLowerCase()
     ).length;
   }
 
   /** Open the upload-dialog, then mark that company has documents */
   openUploadDialog(companyId: number): void {
    //  const company = this.dataSource.data.find((c) => c.id === companyId);
    //  if (!company) {
    //    this.snackBarService.show("Company not found.", "Close");
    //    return;
    //  }
 
    //  const dialogRef = this.dialog.open(UploadFormDialogComponent, {
    //    autoFocus: false,
    //    width: "600px",
    //    maxHeight: "90vh",
    //    data: {
    //      companyId: companyId,
    //      companyName: company.company,
    //      isEinSelected: company.isEinSelected,
    //    },
    //  });
 
    //  dialogRef.afterClosed().subscribe((result: boolean) => {
    //    if (result) {
    //      if (company) {
    //        company.hasDocuments = true;
    //        this.snackBarService.showSuccess(
    //          "Document uploaded successfully.",
    //          "Close"
    //        );
    //      }
    //    }
    //  });
   }
   /** Open the PDF-viewer dialog for that company */
   openDetailsViewer(companyId: number): void {
    //  const company = this.dataSource.data.find((c) => c.id === companyId);
    //  if (!company) {
    //    this.snackBarService.show("Company not found.", "Close");
    //    return;
    //  }
    //  this.dialog.open(DocumentViewerDialogComponent, {
    //    autoFocus: false,
    //    width: "90vw",
    //    maxWidth: "1200px",
    //    height: "90vh",
    //    data: { company, isEinSelected: company.isEinSelected },
    //  });
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
              this.snackBarService.show("Company details not found.");
            }
          },
          error: () => {
            this.snackBarService.show(
              "Unable to load company details. Please try again."
            );
          },
        });

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
 
   onSearch(): void {
     this.pageIndex = 0;
     this.paginator.firstPage();
     this.loadPage();
   }
 
   onStateSelected(state: string): void {
     this.stateControl.setValue(state);
     this.pageIndex = 0;
     this.paginator.firstPage();
     this.loadPage();
   }
 
   clearState(): void {
     this.stateControl.setValue("");
     this.pageIndex = 0;
     this.paginator.firstPage();
     this.loadPage();
   }
 
   toggleStateSearch(): void {
     this.showStateSearch = !this.showStateSearch;
   }
   clearFilters(): void {
     this.searchValue = "";
     this.stateControl.setValue("");
     this.pageIndex = 0;
     this.paginator.pageIndex = 0;
     this.loadPage();
   }
}
