import { Component, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { InvoiceService } from "src/app/services/apps/invoice/invoice.service";
import { InvoiceList } from "src/app/models/invoice";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { MaterialModule } from "src/app/material.module";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgIcon } from "@ng-icons/core";
import { TokenService } from "src/app/services/token/token.service";
import { LoadingService } from "src/app/services/loading/loading.service";

@Component({
  selector: "app-invoice-view",
  templateUrl: "./invoice-view.component.html",
  styleUrls: ["./invoice-view.component.scss"],
  imports: [
    MaterialModule,
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    // NgIcon,
  ],
})
export class InvoiceViewComponent {
  id = signal<number>(0);
  invoiceDetail = signal<InvoiceList | null>(null);
  isAdmin = signal<boolean>(false);
  displayedColumns: string[] = ["itemName", "unitPrice", "unit", "total"];

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private snackBarService: SnackBarService,
    private tokenService: TokenService,
    private loadingService: LoadingService
  ) {
    this.checkUserRole();
    this.id.set(Number(this.route.snapshot.paramMap.get("id")));
    this.loadInvoiceDetail();
  }

  private checkUserRole(): void {
    const role = this.tokenService.getRole();
    this.isAdmin.set(role === "Admin");
  }

  private loadInvoiceDetail(): void {
    this.loadingService.show("Generating Invoice Details...");
    const id = this.id(); // from the route param
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice: any | null) => {
        if (invoice) {
          this.invoiceDetail.set(invoice);
          console.log("Invoice Detail:", this.invoiceDetail());
        } else {
          this.snackBarService.showError("Invoice not found in cache");
        }
      },
    });
    this.loadingService.hide();
  }

  public downloadDocument(): void {
    this.loadingService.show("Downloading...");
    const invoice = this.invoiceDetail();
    if (!invoice) {
      this.snackBarService.showError("Invoice data not available.");
      return;
    }
    this.invoiceService.generateDocument(invoice).subscribe({
      next: (blob: Blob) => {
        if (!blob) {
          this.snackBarService.showError("No document received.");
          return;
        }
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${invoice.billTo}_Invoice.pdf`;
        link.click();
        window.URL.revokeObjectURL(blobUrl);
        this.snackBarService.showSuccess("Invoice downloaded successfully.");
      },
    });
    this.loadingService.hide();
  }
}
