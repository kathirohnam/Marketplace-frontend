import { Component, AfterViewInit, ViewChild, OnInit } from "@angular/core";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { ConsumerService } from "src/app/services/apps/vendor/consumer-service";
import { ConfirmDialogComponent } from "../../../../shared/confirm-dialog.component";
import { MaterialModule } from "src/app/material.module";
import { CommonModule } from "@angular/common";
import { NgIcon } from "@ng-icons/core";
import { RouterModule } from "@angular/router";
import { ConsumerElement } from "src/app/models/consumer";

/**
 * Component to display and manage a list of consumers
 */
@Component({
    selector: "app-consumer-list",
    imports: [
        MaterialModule,
        CommonModule,
        NgIcon,
        RouterModule,
        // ConfirmDialogComponent,
    ],
    templateUrl: "./consumer-list.component.html"
})
export class ConsumerListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable) table!: MatTable<ConsumerElement>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    "email",
    "firstName",
    "lastName",
    "phone",
    "role",
    "action",
  ];
  dataSource = new MatTableDataSource<ConsumerElement>([]);
  totalCount = 0;

  constructor(
    private consumerService: ConsumerService,
    private router: Router,
    private dialog: MatDialog,
    private snackBarService: SnackBarService
  ) {}

  ngOnInit(): void {
    this.loadConsumers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Loads consumers from the service and updates the table
   */
  private async loadConsumers(): Promise<void> {
    try {
      const consumers = await this.consumerService.getConsumers().toPromise();
      this.dataSource.data = consumers ?? [];
      this.totalCount = this.dataSource.data.length;
    } catch (error: any) {}
  }

  /**
   * Filters the table based on user input
   */
  onKeyup(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  /**
   * Navigates to the consumer form for adding or editing
   */
  navigateToConsumerForm(id?: number): void {
    if (id) {
      this.router.navigate(["/apps/consumer/edit"], { queryParams: { id } });
    } else {
      this.router.navigate(["/apps/consumer/add"]);
    }
  }

  /**
   * Deletes a consumer after confirmation
   */
  async deleteConsumer(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "400px",
      data: {
        title: "Confirm Delete",
        message: "Are you sure you want to delete this consumer?",
      },
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (!confirmed) return;

    try {
      await this.consumerService.deleteConsumer(id).toPromise();
      this.snackBarService.showError("Consumer deleted successfully");
      await this.loadConsumers();
      this.table.renderRows();
    } catch (error: any) {}
  }
}
