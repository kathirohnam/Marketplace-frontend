import { Component, AfterViewInit, ViewChild, signal } from "@angular/core";
import {
  InvoiceService,
  PagedResponse,
} from "src/app/services/apps/invoice/invoice.service";
import { InvoiceList } from "src/app/models/invoice";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { ConfirmDialogComponent } from "src/app/shared/confirm-dialog.component";
import { MaterialModule } from "src/app/material.module";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgIcon } from "@ng-icons/core";
import { RouterModule } from "@angular/router";
import { TokenService } from "src/app/services/token/token.service";
import { LoadingService } from "src/app/services/loading/loading.service";

@Component({
  selector: "app-invoice-list",
  templateUrl: "./invoice-list.component.html",
  styleUrl: "./invoice-list.component.scss",
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgIcon,
  ],
})
export class InvoiceListComponent implements AfterViewInit {
  dataSource = new MatTableDataSource<InvoiceList>([]);
  displayedColumns: string[] = [
    "id",
    "invoiceId",
    "duePaid",
    "company",
    "totalCost",
    "status",
    "action",
  ];

  isAdmin = signal<boolean>(false);
  activeTab = signal<string>("All");
  searchTerm = signal<string>("");

  searchValue = "";

  allComplete = signal<boolean>(false);

  totalItems = 0;
  pageIndex = 0;
  pageSize = 5;
  lastPage = false;

  private allUserInvoices: InvoiceList[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private isInitialLoad = true;

  constructor(
    public invoiceService: InvoiceService,
    private dialog: MatDialog,
    private snackBar: SnackBarService,
    private router: Router,
    private tokenService: TokenService,
    private loadingService: LoadingService
  ) {
    const role = this.tokenService.getRole();
    this.isAdmin.set(role === "Admin");
    if (!this.isAdmin()) {
      this.displayedColumns = this.displayedColumns.filter((c) => c !== "id");
    }
  }

  ngAfterViewInit(): void {
    this.loadingService.show("Loading Invoices...");
    this.dataSource.sort = this.sort;

    if (this.isAdmin()) {
      this.pageIndex = 0;
      this.pageSize = 5;
      this.loadAdminPage();
      this.paginator.page.subscribe((evt: PageEvent) => {
        this.pageIndex = evt.pageIndex;
        this.pageSize = evt.pageSize;
        this.loadAdminPage();
      });
    } else {
      const userId = localStorage.getItem("login_user_id")!;
      this.invoiceService.fetchUserInvoices(userId).subscribe((list) => {
        this.allUserInvoices = list;
        this.dataSource.paginator = this.paginator;
        this.dataSource.data = list;
        this.paginator.length = list.length;
        this.updateAllComplete();
      });
    }
    this.loadingService.hide();
  }

  private loadAdminPage(): void {
    if (this.lastPage && this.pageIndex > this.paginator.pageIndex) return;
    this.invoiceService
      .fetchAdminPage(this.pageIndex, this.pageSize, this.searchTerm())
      .subscribe((resp: PagedResponse<InvoiceList>) => {
        this.dataSource.data = resp.content;
        this.totalItems = resp.totalElements;
        this.lastPage = resp.last;
        this.paginator.length = resp.totalElements;
        this.paginator.pageIndex = resp.page;
        this.paginator.pageSize = resp.size;
        this.updateAllComplete();
      });
  }

  handleTabClick(tab: string): void {
    this.activeTab.set(tab);
    if (this.isAdmin()) {
      this.pageIndex = 0;
      this.paginator.pageIndex = 0;
      this.loadAdminPage();
    } else {
      this.applyClientFilter();
    }
  }

  onSearch(value: string): void {
    const term = value.trim();
    this.searchTerm.set(term);
    if (this.isAdmin()) {
      this.pageIndex = 0;
      this.paginator.pageIndex = 0;
      this.loadAdminPage();
    } else {
      this.applyClientFilter();
    }
  }

  private applyClientFilter(): void {
    const tab = this.activeTab();
    const search = this.searchTerm().toLowerCase();
    const filtered = this.allUserInvoices.filter((inv) => {
      const matchesTab = tab === "All" || inv.status === tab;
      const matchesSearch =
        inv.billFrom.toLowerCase().includes(search) ||
        inv.billTo.toLowerCase().includes(search);
      return matchesTab && matchesSearch;
    });
    this.dataSource.data = filtered;
    this.paginator.length = filtered.length;
    this.updateAllComplete();
  }

  countInvoicesByStatus(status: string): number {
    return this.isAdmin()
      ? this.dataSource.data.filter((inv) => inv.status === status).length
      : this.allUserInvoices.filter((inv) => inv.status === status).length;
  }

  deleteInvoice(id: number): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: "Confirm Delete", message: "Are you sure?" },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.invoiceService.deleteInvoice(id).subscribe((res) => {
          if (res.success) {
            this.snackBar.showSuccess(res.message!);
            this.isAdmin() ? this.loadAdminPage() : this.applyClientFilter();
          }
        });
      }
    });
  }

  // refreshInvoiceList(): void {
  //   if (this.isAdmin()) {
  //     this.lastPage = false;
  //     this.pageIndex = 0;
  //     this.paginator.pageIndex = 0;

  //     this.loadAdminPage();
  //   } else {
  //     const userId = localStorage.getItem('login_user_id')!;
  //     this.invoiceService.clearUserInvoiceCache();
  //     this.invoiceService.fetchUserInvoices(userId).subscribe((list) => {
  //       this.allUserInvoices = list;
  //       this.applyClientFilter();
  //       this.snackBar.showSuccess('Invoices reloaded');
  //     });
  //   }
  // }

  updateAllComplete(): void {
    const data = this.dataSource.data as any[];
    this.allComplete.set(data.length > 0 && data.every((t) => t.completed));
  }
  someComplete(): boolean {
    const data = this.dataSource.data as any[];
    return data.some((t) => t.completed) && !this.allComplete();
  }
  setAll(completed: boolean): void {
    this.allComplete.set(completed);
    (this.dataSource.data as any[]).forEach((t) => (t.completed = completed));
    this.dataSource._updateChangeSubscription();
  }
  navigateToEdit(id: number): void {
    this.router.navigate(["/apps/editinvoice", id]);
  }

  navigateToView(id: number): void {
    this.router.navigate(["/apps/viewInvoice", id]);
  }
  clearSearch(): void {
    this.searchTerm.set("");
    this.searchValue = "";

    if (this.isAdmin()) {
      this.pageIndex = 0;
      this.paginator.pageIndex = 0;
      this.loadAdminPage();
    } else {
      this.applyClientFilter();
    }
  }
}
