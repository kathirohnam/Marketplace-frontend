import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource, MatTable } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { Router, RouterModule } from "@angular/router";

import { AdminService } from "src/app/services/apps/admin/admin.service";
import { ConfirmDialogComponent } from "../../../../shared/confirm-dialog.component";
import { MaterialModule } from "src/app/material.module";
import { CommonModule } from "@angular/common";
import { NgIcon } from "@ng-icons/core";
import { AdminElement } from "src/app/models/admin";
import { FormsModule } from "@angular/forms";

/**
 * Utility function to display snackbar messages.
 */

@Component({
    selector: "app-admin-list",
    imports: [MaterialModule, CommonModule, NgIcon, RouterModule, FormsModule],
    templateUrl: "./admin-AllUserList.component.html",
    styles: [
        `
      .btn {
        background: #007bff;
        color: white;
        font-weight: 600;
        padding: 12px 24px;
        border-radius: 8px;
        text-transform: none;
        box-shadow: none;
        border: none;
        font-size: 14px;
      }

      .btn:hover {
        background: #0056b3;
      }
    `,
    ]
})
export class AllUsersListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable) table!: MatTable<AdminElement>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = [
    "email",
    "firstName",
    "lastName",
    "phone",
    "role",
    "action",
  ];
  dataSource = new MatTableDataSource<AdminElement>([]);
  totalCount = 0;
  private isLoading = false;
  searchValue = "";

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBarService: SnackBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private loadAdmins(): void {
    this.adminService.getAdmins().subscribe({
      next: (fresh) => {
        this.dataSource.data = fresh;
        this.totalCount = fresh.length;
        this.table.renderRows(); // force re-render if needed
      },
      error: () => this.snackBarService.showError("Background refresh failed"),
    });
  }

  onKeyup(e: KeyboardEvent): void {
    this.searchValue = (e.target as HTMLInputElement).value.trim();
    this.dataSource.filter = this.searchValue.toLowerCase();
  }

  btnCategoryClick(role: string): void {
    this.dataSource.filter = role.trim().toLowerCase();
  }

  countAdminsByRole(role: string): number {
    return this.dataSource.data.filter((admin) => admin.role === role).length;
  }

  navigateToAdminForm(admin?: AdminElement): void {
    if (admin) {
      // pass both state and id in queryParams for deep-link fallback
      this.router.navigate(["/apps/admin", "edit"], {
        state: { admin },
        queryParams: { id: admin.id },
      });
    } else {
      this.router.navigate(["/apps/admin", "add"]);
    }
  }

  deleteAdmin(admin: AdminElement): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: "400px",
      data: {
        title: `Delete ${admin.role}`,
        message: `Confirm delete this ${admin.role.toLowerCase()}?`,
      },
    });

    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;

      this.adminService.deleteAdmin(admin.id!, admin.role).subscribe({
        next: () => {
          this.snackBarService.showError(`${admin.role} deleted successfully`);
          this.adminService.clearCache();
          this.loadAdmins();
        },
      });
    });
  }
  clearSearch(): void {
    this.searchValue = "";
    this.dataSource.filter = "";
    this.table.renderRows();
  }
}
