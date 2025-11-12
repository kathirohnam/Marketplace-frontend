export class Order {
  constructor(
    public itemName: string = '',
    public unitPrice: number = 0,
    public units: number = 0,
    public unitTotalPrice: number = 0
  ) {}
}

export class InvoiceList {
  static autoIncrementId = 1;

  constructor(
    public id: number = 0,
    public invoiceId: string = '',
    public status: string = '',
    public state: string = '',
    public orderDate: Date = new Date(),
    public orders: Order[] = [],
    public grandTotal: number = 0,
    public billFromAddress: string | null = null,
    public billFromEmail: string = '',
    public billTo: string = '',
    public billFrom: string = '',
    public billToEmail: string = '',
    public billToAddress: string = '',
    public billFromPhone: string = '',
    public billToPhone: string | null = null,
    public completed: boolean = false,
    public isSelected: boolean = false
  ) {}
}