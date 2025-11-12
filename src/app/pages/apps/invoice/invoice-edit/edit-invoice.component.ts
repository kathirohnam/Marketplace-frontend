import { Component, ErrorHandler, signal, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InvoiceService } from "src/app/services/apps/invoice/invoice.service";
import { InvoiceList, Order } from "src/app/models/invoice";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  NgForm,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { OkDialogComponent } from "./ok-dialog/ok-dialog.component";
import { MaterialModule } from "src/app/material.module";
import { CommonModule } from "@angular/common";
import { NgIcon } from "@ng-icons/core";
import { ErrorHandlerUtil } from "src/app/shared/error-handler.util";

@Component({
    selector: "app-edit-invoice",
    templateUrl: "./edit-invoice.component.html",
    imports: [
        MaterialModule,
        CommonModule,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        NgIcon,
    ]
})
export class EditInvoiceComponent {
  @ViewChild("invoiceForm") invoiceForm!: NgForm;
  id = signal<number | null>(null);
  invoice = signal<InvoiceList | null>(null);
  subTotal = signal<number>(0);
  grandTotal = signal<number>(0);
  addForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBarService: SnackBarService,
    private errorHandler: ErrorHandlerUtil
  ) {
    this.addForm = this.fb.group({
      item: this.fb.array([]),
    });

    this.id.set(Number(this.route.snapshot.paramMap.get("id")));
    this.loadInvoice();
  }

  private loadInvoice(): void {
    const invoice = this.invoiceService
      .getInvoiceList()
      .find((x) => x.id === this.id());
    if (invoice) {
      this.invoice.set(invoice);
      this.subTotal.set(invoice.grandTotal);
      this.grandTotal.set(invoice.grandTotal);
      this.fillFormControls(invoice.orders);
    } else {
      this.snackBarService.showError("Invoice not found");
      this.router.navigate(["/apps/invoice"]); // Navigate back if not found
    }
  }

  private fillFormControls(orders: Order[]): void {
    const itemArray = this.items;
    itemArray.clear();
    orders.forEach((order) => {
      itemArray.push(
        this.fb.group({
          itemName: [order.itemName, Validators.required],
          itemCost: [order.unitPrice, Validators.required],
          itemSold: [order.units, Validators.required],
          itemTotal: [order.unitTotalPrice],
        })
      );
    });
    if (orders.length === 0) {
      this.addItem();
    }
  }

  get items(): FormArray {
    return this.addForm.get("item") as FormArray;
  }

  private createItemControl(): FormGroup {
    return this.fb.group({
      itemName: ["", Validators.required],
      itemCost: ["", [Validators.required, Validators.min(0)]],
      itemSold: ["", [Validators.required, Validators.min(0)]],
      itemTotal: [{ value: 0, disabled: true }],
    });
  }

  addItem(): void {
    this.items.push(this.createItemControl());
  }

  removeItem(index: number): void {
    const item = this.items.at(index).value;
    const totalCost = item.itemCost * item.itemSold;
    this.grandTotal.set(this.grandTotal() - totalCost);
    this.items.removeAt(index);
  }

  updateTotals(): void {
    const total = this.items.controls.reduce((sum, control) => {
      const item = control.value;
      const totalCost =
        item.itemCost && item.itemSold ? item.itemCost * item.itemSold : 0;
      control.patchValue({ itemTotal: totalCost }, { emitEvent: false });
      return sum + totalCost;
    }, 0);
    this.subTotal.set(total);
    this.grandTotal.set(total);
  }

  saveInvoice(event: Event): void {
    event.preventDefault();
    if (this.invoiceForm.invalid || this.addForm.invalid) {
      this.snackBarService.showError("Please fill all required fields");
      return;
    }

    const currentInvoice = this.invoice();
    if (!currentInvoice) {
      this.snackBarService.showError("No invoice to update");
      return;
    }

    currentInvoice.grandTotal = this.grandTotal();
    currentInvoice.orders = this.items.controls.map((control) => {
      const item = control.value;
      return new Order(
        item.itemName,
        item.itemCost,
        item.itemSold,
        item.itemCost * item.itemSold
      );
    });

    this.invoiceService
      .updateInvoice(currentInvoice.id, currentInvoice)
      .subscribe({
        next: (response) => {
          this.dialog.open(OkDialogComponent);
          this.router.navigate(["/apps/invoice"]);
          this.snackBarService.showSuccess(
            response.message || "Invoice updated successfully"
          );
        },
      });
  }
}
