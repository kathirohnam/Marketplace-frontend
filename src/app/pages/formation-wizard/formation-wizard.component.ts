import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
  AfterViewInit,
} from "@angular/core";
import { Location } from "@angular/common";

import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
  FormGroupDirective,
  NgForm,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";

import { ErrorStateMatcher } from "@angular/material/core";
import { MaterialModule } from "src/app/material.module";
import { CommonModule, DatePipe } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgIcon, NgIconComponent } from "@ng-icons/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import { MatStepper } from "@angular/material/stepper";
import {
  CompanyFormationState,
  CompanyNameDetails,
  FormationDate,
  BusinessDescription,
  EINDetails,
  OperatingAgreementDetails,
  ExpeditedDetails,
  ManagementDetails,
  MemberDetails,
  ManagerDetails,
  Address,
  RegisteredAgentDetails,
  PrimaryContactDetails,
  MailingAddress,
  PaymentCharges,
  CompanyCheckResponse,
  AgentDetails,
  CompanyFormationForms,
} from "src/app/models/company-formation";
import { LoadingService } from "src/app/services/loading/loading.service";
import { CompanyFormationService } from "src/app/services/apps/formation-wizard/formation-wizard.service";
import { NgxMaskDirective, NgxMaskPipe } from "ngx-mask";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { Observable, forkJoin, of } from "rxjs";
import { catchError, map, startWith, tap } from "rxjs/operators";
import { AppBreadcrumbService } from "src/app/layouts/full/shared/breadcrumb/breadcrumb.service";
import {
  StripeService,
  StripeElementsService,
  StripePaymentElementComponent,
} from "ngx-stripe";
import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import { MatIconModule } from "@angular/material/icon";
import { CompanyAvailabilityDialogComponent } from "src/app/shared/company-availability-dialog.component";
import { PaymentConfirmationDialogComponent } from "src/app/shared/payment-confirmation-dialog.component";
import { TermsDialogComponent } from "src/app/shared/terms-dialog.component";
import { TokenService } from "src/app/services/token/token.service";
import { BusinessNameCheckDialogComponent } from "src/app/shared/business-name-check-dialog/business-name-check-dialog.component";

import { AutoFocusNextDirective } from "src/app/shared/auto-focus-next.directive";

export class TouchedOnlyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}

@Component({
  selector: "app-wizard",
  imports: [
    NgIcon,
    MaterialModule,
    FormsModule,
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule,
    NgxMaskDirective,
    // NgxMaskPipe,
    // CompanyAvailabilityDialogComponent,
    // PaymentConfirmationDialogComponent,
    NgIconComponent,
   
    AutoFocusNextDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./formation-wizard.component.html",
  styleUrls: ["./formation-wizard.component.scss"],
  providers: [
    { provide: ErrorStateMatcher, useClass: TouchedOnlyErrorStateMatcher },
  ],
})
export class FormationWizardComponent implements OnInit, AfterViewInit {
  @ViewChild("stepper") private stepper!: MatStepper;
  @ViewChild("memberStepper") memberStepper!: MatStepper;
  @ViewChild("managerStepper") managerStepper!: MatStepper;
  @ViewChild(StripePaymentElementComponent)
  paymentElement!: StripePaymentElementComponent;
  @ViewChild("secureDialog") secureDialog!: TemplateRef<any>;

  private readonly STATUS_CONTENT_MAP = {
    succeeded: { text: "Payment succeeded! 🎉", iconColor: "#30B130" },
    processing: {
      text: "Your payment is being processed...",
      iconColor: "#6D6E78",
    },
    requires_payment_method: {
      text: "Payment failed. Please try again.",
      iconColor: "#DF1B41",
    },
    default: {
      text: "Something went wrong. Please try again.",
      iconColor: "#DF1B41",
    },
  };

  // Data for principal activities
  // principalActivities: { id: number; value: string }[] = [];
  principalActivities: string[] = [];

  // Form groups
  einApplicationForm: FormGroup;
  isDifferentMailingAddress = false; // Change this to control when to show mailing fields
  usePhysicalAddressForMailing = true;
  useAddress = false;
  isSaving = false;
  reasonForApplying: any[] = [];
  subcategoryValue: string[] = [];
  stateFormGroup: FormGroup;
  businessFormGroup: FormGroup;
  formationDateFormGroup: FormGroup;
  businessDescriptionFormGroup: FormGroup;
  einFormGroup: FormGroup;
  operatingAgreementFormGroup: FormGroup;
  expeditedFormGroup: FormGroup;
  managementFormGroup: FormGroup;
  memberForm: FormGroup;
  managerForm: FormGroup;
  addressForm: FormGroup;
  registeredAgentForm: FormGroup;
  primaryContactForm: FormGroup;

  // Error state matcher instance
  errorStateMatcher = new TouchedOnlyErrorStateMatcher();

  myControl = new FormControl<string | null>("");
  filteredStates: Observable<string[]>;
  states: string[] = [];
  llcSuffixes: string[] = [];
  companyId?: number;
  today: Date = new Date();
  activeStepIndex = 0;
  isEditMode = false;
  isMobile = false;
  registerAgentFee = 0;
  isPaymentSuccessful = false;
  paymentInitiated = false;
  includeAgreement = false;
  needEin = false;
  expeditedService = false;
  isSavingExpedited = false;
  stateFee = 0;
  einFee = 0;
  agreementFee = 0;
  expeditedFee = 0;
  totalCharges = 0;
  totalOwnership = 0;
  managementStyle = "";
  hoveredIndex: number | null = null;
  stripeDashboardUrl: string | null = null;
  stripeElements: StripeElements | null = null;
  stripeInstance: Stripe | null = null;
  clientSecret = "";
  paymentStatus = "";
  statusText = "";
  statusColor = "#6D6E78";
  paymentIntentId: string | null = null;
  isAgreedRegForm1 = false;
  isAgreedRegForm3 = false;
  isAgreedRegForm4 = false;
  hidePrevButton = false;
  hideStepContent = false;
  useRegisteredAgent = false;
  hasDialogOpened = false;
  termsAccepted = false;
  selectedEinResponsiblePartyIndex: number | null = null;
  isPaymentDone = false;
  choosingManagementStyle = false;
  launchedLLC = false;

  private isStepNavigation = false;
  filteredPrincipalActivities!: Observable<string[]>;
  hoveredPrincipalActivityIndex: number | null = null;
  selectedSubActivities: string[] = [];

  months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  private formFactory: CompanyFormationForms;

  private formChangeFlags = {
    state: true,
    business: false,
    formationDate: false,
    businessDescription: false,
    registeredAgent: false,
    member: false,
    manager: false,
    address: false,
    primaryContact: false,
    ein: false,
    operatingAgreement: false,
    expedited: false,
    management: false,
    regForm1: false,
    regForm3: false,
    regForm4: false,
  };

  constructor(
    private fb: FormBuilder,
    private formationService: CompanyFormationService,
    private breakpointObserver: BreakpointObserver,
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    private snackBarService: SnackBarService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private stripeService: StripeService,
    private stripeElementsService: StripeElementsService,
    private breadcrumbService: AppBreadcrumbService,
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService,
    private tokenService: TokenService,
    private location: Location
  ) {
    this.formFactory = new CompanyFormationForms(this.fb);
    this.initializeForms();
    this.setupFilteredStates();
  }

  private initializeForms(): void {
    this.stateFormGroup = this.formFactory.createStateFormGroup(this.myControl);
    this.businessFormGroup = this.formFactory.createBusinessFormGroup();
    this.formationDateFormGroup =
      this.formFactory.createFormationDateFormGroup();
    this.einFormGroup = this.formFactory.createEinFormGroup();
    this.operatingAgreementFormGroup =
      this.formFactory.createOperatingAgreementFormGroup();
    this.expeditedFormGroup = this.formFactory.createExpeditedFormGroup();
    this.managementFormGroup = this.formFactory.createManagementFormGroup();
    this.memberForm = this.formFactory.createMemberForm();
    this.managerForm = this.formFactory.createManagerForm();
    this.addressForm = this.formFactory.createAddressForm();
    this.registeredAgentForm = this.formFactory.createRegisteredAgentForm();
    this.primaryContactForm = this.formFactory.createPrimaryContactForm();
    this.einApplicationForm = this.formFactory.createEinApplicationForm();
    this.businessDescriptionFormGroup =
      this.formFactory.createBusinessDescriptionFormGroup();
  }

  private setupFilteredStates(): void {
    this.filteredStates = this.myControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterStates(value || ""))
    );
  }

  ngOnInit(): void {
    this.loadingService.show("Loading…");
    this.fetchStates();
    this.fetchLLCSuffixes();
    this.fetchReasonForApplying();
    this.fetchPrincipalActivities();

    this.handleRouteParams();
    this.setupBreakpointObserver();
    this.setupRegisteredAgentObserver();
    this.setupEinObserver();
    this.checkboxvalues();

    this.loadingService.hide();
  }

  private checkboxvalues() {
    this.setupCheckboxWatcher("husbandWifeMembers", ["LLCType"]);
    this.setupCheckboxWatcher("paysFederalExciseTaxes", [
      "previousFederalTaxId",
    ]);
    this.setupCheckboxWatcher("hireEmployeeIn12Months", [
      "firstWageDate",
      "householdEmployees",
      "agriculturalEmployees",
      "otherEmployees",
    ]);
  }

  ngAfterViewInit(): void {
    // Ensure forms are properly marked after view initialization
    setTimeout(() => {
      this.markAllFormsAsClean();
      this.cdr.detectChanges();
    }, 0);
  }

  private setupEinObserver(): void {
    this.einFormGroup.get("EIN")?.valueChanges.subscribe((value: boolean) => {
      this.needEin = value;
      if (!value) {
        // Reset EIN responsible party selection when EIN is disabled
        this.clearEinResponsibleParty();
      }
    });
  }

  selectEinResponsibleParty(memberIndex: number): void {
    // Clear previous selection
    if (this.selectedEinResponsiblePartyIndex !== null) {
      const previousMember = this.getMember(
        this.selectedEinResponsiblePartyIndex
      );
      previousMember.patchValue({
        isEinResponsibleParty: false,
        einTaxId: "",
      });
    }

    // Set new selection
    this.selectedEinResponsiblePartyIndex = memberIndex;
    const selectedMember = this.getMember(memberIndex);
    selectedMember.patchValue({
      isEinResponsibleParty: true,
    });

    // Add required validator to the tax ID field
    const taxIdControl = selectedMember.get("einTaxId");
    taxIdControl?.setValidators([
      Validators.required,
      Validators.pattern(
        "^[0-9]{3}-[0-9]{2}-[0-9]{4}$|^[0-9]{2}-[0-9]{7}$|^[0-9]{9}$"
      ),
    ]);
    taxIdControl?.updateValueAndValidity();
  }
  onEinResponsiblePartyChange(memberIndex: number, isChecked: boolean): void {
    if (isChecked) {
      this.selectEinResponsibleParty(memberIndex);
    } else {
      this.clearEinResponsibleParty();
    }
  }

  clearEinResponsibleParty(): void {
    if (this.selectedEinResponsiblePartyIndex !== null) {
      const member = this.getMember(this.selectedEinResponsiblePartyIndex);
      member.patchValue({
        isEinResponsibleParty: false,
        einTaxId: "",
      });

      // Remove validators from tax ID field
      const taxIdControl = member.get("einTaxId");
      taxIdControl?.clearValidators();
      taxIdControl?.updateValueAndValidity();
    }
    this.selectedEinResponsiblePartyIndex = null;
  }

  isEinResponsibleParty(memberIndex: number): boolean {
    return this.selectedEinResponsiblePartyIndex === memberIndex;
  }

  shouldShowEinCheckboxes(): boolean {
    return this.needEin; // Show checkbox for all members when EIN is needed
  }

  shouldShowEinTaxIdInput(memberIndex: number): boolean {
    return false; // Always return false since we don't show SSN input in member form
  }

  private propagateStateToDependentForms() {
    const stateValue =
      this.stateFormGroup.get("stateCtrl")?.value || this.myControl.value || "";
    this.registeredAgentForm.get("state")?.setValue(stateValue);
    this.addressForm.get("state")?.setValue(stateValue);
  }
  private handleRouteParams(): void {
    // 1) Prefer navigation state
    const navState = history && history.state ? history.state : {};
    const stateStep =
      typeof navState.step === "number"
        ? navState.step
        : navState.step
        ? Number(navState.step)
        : undefined;
    const stateCompanyId =
      typeof navState.companyId === "number"
        ? navState.companyId
        : navState.companyId
        ? Number(navState.companyId)
        : undefined;
    const statePaymentIntent = navState.payment_intent || null;

    // 2) Fallback: one-time read from query params (e.g., Stripe return)
    const qp = this.route.snapshot.queryParamMap;
    const qpPaymentIntent = qp.get("payment_intent"); // optional/rare
    const qpStep = qp.get("step");
    const qpCompanyId = qp.get("companyId");

    this.companyId =
      stateCompanyId ?? (qpCompanyId ? Number(qpCompanyId) : undefined);
    this.activeStepIndex = stateStep ?? (qpStep ? Number(qpStep) : 0);
    this.paymentIntentId = statePaymentIntent ?? (qpPaymentIntent || null);
    this.isEditMode = !!this.companyId;

    if (this.stepper) {
      this.stepper.selectedIndex = this.activeStepIndex;
    }
    if (this.paymentIntentId) {
      this.checkPaymentStatus();
    }
    if (this.activeStepIndex >= 12) {
      this.isPaymentSuccessful = true;
    }

    // 3) Load data or init forms
    if (this.isEditMode && this.companyId && !this.isStepNavigation) {
      this.loadCompanyProgress();
    } else {
      this.initializeCleanForms();
    }

    // 4) Strip any query string from URL and persist the state cleanly
    //    (keeps URL like /wizard/forms with invisible step/companyId in history.state)
    const cleanPath = this.router.url.split("?")[0];
    const mergedState = {
      ...navState,
      step: this.activeStepIndex,
      companyId: this.companyId,
      payment_intent: this.paymentIntentId,
    };
    this.location.replaceState(cleanPath, "", mergedState as any);
  }

  private loadCompanyProgress(): void {
    this.loadingService.show("Loading company formation progress…");
    this.formationService
      .getUserProgressByCompanyId(this.companyId!)
      .subscribe({
        next: (data) => {
          if (data.managementStyle) {
            sessionStorage.setItem("managementStyle", data.managementStyle);
          }
          sessionStorage.setItem("needEin", String(data.step8));
          this.populateFormsWithData(data);
          this.populateEinApplicationForm();
          this.loadingService.hide();
          this.updateUrlWithStepAndCompanyId(this.activeStepIndex);
        },
        error: () => {
          this.loadingService.hide();
          this.snackBarService.showError("Failed to load company progress.");
          this.initializeCleanForms();
        },
      });
  }

  private initializeCleanForms(): void {
    // Don't set up form subscriptions until after initial load
    setTimeout(() => {
      this.propagateStateToDependentForms();
      this.setupFormSubscriptions();
      this.markAllFormsAsClean();
      this.updateUrlWithStepAndCompanyId(this.activeStepIndex);
      this.cdr.detectChanges();
    }, 100);
  }

  selectManagement(style: string) {
    this.managementFormGroup.patchValue({ management: style });
    this.managementStyle = style;
  }

  private populateFormsWithData(data: any): void {
    if (!data) {
      this.initializeCleanForms();
      return;
    }

    // First, reset all forms completely
    this.resetAllForms();

    // Patch forms WITHOUT triggering subscriptions
    this.patchFormsWithoutEmission(data);
    if (data.step8 === true) {
      this.loadSubCategoriesFromPrincipalActivity();
    }
    // Rebuild FormArrays properly
    this.rebuildFormArrays(data);
    this.propagateStateToDependentForms();
    this.launchedLLC = data.step15;
    this.isPaymentDone = data.step12 || false;
    const companyName = data.step2?.companyName || "";
    const llcSuffix = data.step2?.llcSuffix || "";
    const state = data.step1 || "";
    if (companyName) {
      this.breadcrumbService.updateCompanyData(
        `${companyName} ${llcSuffix}`.trim(),
        state
      );
    }

    // Set consent flags
    this.setConsentFlags(data);

    // Set payment data
    this.setPaymentData(data);

    // Mark everything as clean AFTER all patching is done
    setTimeout(() => {
      this.markAllFormsAsClean();
      this.clearAllChangeFlags();
      this.setupFormSubscriptions();

      this.cdr.detectChanges();
    }, 50);
  }

  private patchFormsWithoutEmission(data: any): void {
    console.log("Populating forms with data:", data);

    // Patch all forms with emitEvent: false
    if (data.step1) {
      this.myControl.setValue(data.step1, { emitEvent: false });
      this.stateFormGroup.patchValue(
        { stateCtrl: data.step1 },
        { emitEvent: false }
      );
    }

    if (data.step2) {
      this.businessFormGroup.patchValue(data.step2, { emitEvent: false });
    }

    if (data.step3) {
      this.formationDateFormGroup.patchValue(
        { formationDate: data.step3 },
        { emitEvent: false }
      );
    }

    if (data.step4) {
      this.businessDescriptionFormGroup.patchValue(data.step4, {
        emitEvent: false,
      });
    }

    if (data.step5) {
      this.primaryContactForm.patchValue(data.step5, { emitEvent: false });
    }

    if (data.step6) {
      const useAgent = data.step6.useAddress;
      this.registeredAgentForm.patchValue(
        { ...data.step6, useagentAddress: useAgent },
        { emitEvent: false }
      );
      if (data.step6.useAddress) {
        [
          "firstName",
          "lastName",
          "streetAddress1",
          "streetAddress2",
          "state",
          "city",
          "zipCode",
        ].forEach((field) => this.registeredAgentForm.get(field)?.disable());
      }
    }

    if (data.step8 !== undefined) {
      this.einFormGroup.patchValue({ EIN: data.step8 }, { emitEvent: false });
    }

    if (data.step9 !== undefined) {
      this.operatingAgreementFormGroup.patchValue(
        { OA: data.step9 },
        { emitEvent: false }
      );
    }

    if (data.step10 !== undefined) {
      this.expeditedFormGroup.patchValue(
        { Expedit: data.step10 },
        { emitEvent: false }
      );
    }

    // if (data.step13a?.length || data.step13b?.length) {
    //   this.managementFormGroup.patchValue(
    //     {
    //       management: data.step13a?.length
    //         ? 'manager'
    //         : data.step13b?.length
    //         ? 'member'
    //         : '',
    //     },
    //     { emitEvent: false }
    //   );
    // }
    if (data.managementStyle) {
      this.managementFormGroup.patchValue(
        { management: data.managementStyle },
        { emitEvent: false }
      );
      this.managementStyle = data.managementStyle;
    }

    if (data.step14) {
      const stateFromStep1 = data.step1 || this.stateFormGroup.value.stateCtrl; // Get state from step1 or use current state if step1 is not available

      this.addressForm.patchValue(
        {
          ...data.step14,
          useOurAddress: data.step14.useAddress || false, // Use existing useAddress or default to false
          state: stateFromStep1, // Ensure state is patched from step1
        },
        { emitEvent: false }
      );
      if (data.step14.useAddress) {
        this.useAddress = true;
        this.addressForm.disable({ emitEvent: false });
        this.addressForm.get("useOurAddress")?.enable({ emitEvent: false });
      }
    }
    if (data.einApplication) {
      // Patch Section A (responsible party)
      this.einApplicationForm.patchValue(
        {
          responsiblePartyName: data.einApplication.responsiblePartyName || "",
          ssnItin: data.einApplication.ssnItin || "",
          verifySsnItin: data.einApplication.verifySsnItin || "",
          llcName: data.einApplication.llcName || "",
          numberOfMembers: data.einApplication.numberOfMembers || "",
          tradeName: data.einApplication.tradeName || "",
          primaryActivity: data.einApplication.primaryActivity || "",
          businessStreetAddress:
            data.einApplication.businessStreetAddress || "",
          businessCity: data.einApplication.businessCity || "",
          businessState: data.einApplication.businessState || "",
          businessZipCode: data.einApplication.businessZipCode || "",
          mailingStreetAddress: data.einApplication.mailingStreetAddress || "",
          mailingCity: data.einApplication.mailingCity || "",
          mailingState: data.einApplication.mailingState || "",
          mailingZipCode: data.einApplication.mailingZipCode || "",
        },
        { emitEvent: false }
      );
      // Enable/disable mailing address if different
      this.isDifferentMailingAddress =
        !!data.einApplication.mailingStreetAddress;
    }
  }

  private rebuildFormArrays(data: any): void {
    // Clear existing arrays
    this.members.clear();
    this.managers.clear();

    // Rebuild members
    if (data.step13b?.length) {
      data.step13b.forEach((mbr: any, index: number) => {
        const memberGroup = this.createCleanMemberFormGroup();
        const taxId = data.ssnId ?? mbr.einTaxId ?? "";

        memberGroup.patchValue(
          {
            firstName: mbr.firstName || "",
            lastName: mbr.lastName || "",
            email: mbr.email || "",
            phoneNumber: mbr.phoneNumber || "",
            ownership: parseInt(mbr.ownership, 10) || 0,
            useAddress: mbr.useAddress || false,
            isEinResponsibleParty: mbr.isEinResponsibleParty || false,
            einTaxId: taxId,
            address: {
              streetAddress1: mbr.streetAddress1 || "",
              streetAddress2: mbr.streetAddress2 || "",
              city: mbr.city || "",
              state: mbr.state || "",
              zipCode: mbr.zipCode || "",
            },
          },
          { emitEvent: false }
        );

        // ← UPDATED: track index based on actual taxId rather than only mbr flag
        if (mbr.isEinResponsibleParty) {
          this.selectedEinResponsiblePartyIndex = index;
        }
        // ← NEW: if they opted to use the default address, disable those controls
        if (mbr.useAddress) {
          const addrGroup = memberGroup.get("address") as FormGroup;
          addrGroup.disable({ emitEvent: false });
        }
        this.markFormGroupAsClean(memberGroup);
        this.members.push(memberGroup);
      });
      this.calculateTotalOwnership();
    } else {
      // Add default member if none exist
      const defaultMember = this.createCleanMemberFormGroup();
      this.markFormGroupAsClean(defaultMember);
      this.members.push(defaultMember);
    }

    // Rebuild managers
    if (data.step13a?.length) {
      data.step13a.forEach((mgr: any) => {
        const managerGroup = this.createCleanManagerFormGroup();
        managerGroup.patchValue(
          {
            firstName: mgr.firstName || "",
            lastName: mgr.lastName || "",
            email: mgr.email || "",
            phoneNumber: mgr.phoneNumber || "",
            useAddress_1: mgr.useAddress || false,
            managerAddress: {
              streetAddress1: mgr.streetAddress1 || "",
              streetAddress2: mgr.streetAddress2 || "",
              city: mgr.city || "",
              state: mgr.state || "",
              zipCode: mgr.zipCode || "",
            },
          },
          { emitEvent: false }
        );
        if (mgr.useAddress) {
          const addrGroup = managerGroup.get("managerAddress") as FormGroup;
          addrGroup.disable({ emitEvent: false });
        }
        this.markFormGroupAsClean(managerGroup);
        this.managers.push(managerGroup);
      });
    } else {
      // Add default manager if none exist
      const defaultManager = this.createCleanManagerFormGroup();
      this.markFormGroupAsClean(defaultManager);
      this.managers.push(defaultManager);
    }
  }

  private createCleanMemberFormGroup(): FormGroup {
    const group = this.formFactory.createMemberFormGroup();
    this.markFormGroupAsClean(group);
    return group;
  }

  private createCleanManagerFormGroup(): FormGroup {
    const group = this.formFactory.createManagerFormGroup();
    this.markFormGroupAsClean(group);
    return group;
  }

  private setConsentFlags(data: any): void {
    this.isAgreedRegForm1 = !!data.step7;
    this.isAgreedRegForm3 = !!data.step15;
  }

  private setPaymentData(data: any): void {
    if (data.step11) {
      this.stateFee = data.step11.stateFee ?? 0;
      this.einFee = data.step11.fileForEin ?? 0;
      this.agreementFee = data.step11.operatingAgreement ?? 0;
      this.expeditedFee = data.step11.expediteRequired ?? 0;
      this.registerAgentFee = data.step11.registerAgentFee ?? 0;
      this.totalCharges = data.step11.totalCharges ?? 0;
      this.needEin = !!data.step11.fileForEin;
      this.includeAgreement = !!data.step11.operatingAgreement;
      this.expeditedService = !!data.step11.expediteRequired;
      this.useRegisteredAgent = !!data.step11.registerAgentFee;
    }
  }

  private markAllFormsAsClean(): void {
    const allForms = [
      this.stateFormGroup,
      this.businessFormGroup,
      this.formationDateFormGroup,
      this.businessDescriptionFormGroup,
      this.primaryContactForm,
      this.registeredAgentForm,
      this.einFormGroup,
      this.operatingAgreementFormGroup,
      this.expeditedFormGroup,
      this.managementFormGroup,
      this.addressForm,
      this.memberForm,
      this.managerForm,
    ];

    allForms.forEach((form) => this.markFormGroupAsClean(form));

    // Also mark the autocomplete control
    this.myControl.markAsUntouched();
    this.myControl.markAsPristine();
  }

  private markFormGroupAsClean(formGroup: FormGroup): void {
    formGroup.markAsUntouched();
    formGroup.markAsPristine();

    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        this.markFormGroupAsClean(control);
      } else if (control instanceof FormArray) {
        control.markAsUntouched();
        control.markAsPristine();
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupAsClean(arrayControl);
          } else {
            arrayControl.markAsUntouched();
            arrayControl.markAsPristine();
          }
        });
      } else {
        control.markAsUntouched();
        control.markAsPristine();
      }
    });
  }

  private clearAllChangeFlags(): void {
    Object.keys(this.formChangeFlags).forEach((key) => {
      this.formChangeFlags[key as keyof typeof this.formChangeFlags] = false;
    });
  }

  private resetAllForms(): void {
    [
      this.stateFormGroup,
      this.businessFormGroup,
      this.formationDateFormGroup,
      this.businessDescriptionFormGroup,
      this.primaryContactForm,
      this.registeredAgentForm,
      this.einFormGroup,
      this.operatingAgreementFormGroup,
      this.expeditedFormGroup,
      this.managementFormGroup,
      this.addressForm,
    ].forEach((form) => form.reset());

    this.memberForm.reset();
    this.managerForm.reset();
    this.myControl.reset();
  }

  private setupBreakpointObserver(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  private setupRegisteredAgentObserver(): void {
    this.registeredAgentForm
      .get("useagentAddress")!
      .valueChanges.subscribe((use: boolean) => {
        this.useRegisteredAgent = use;
      });
  }

  private updateUrlWithStepAndCompanyId(step: number): void {
    this.isStepNavigation = true;
    const cleanPath = this.router.url.split("?")[0];
    const newState = { ...history.state, step, companyId: this.companyId };
    this.location.replaceState(cleanPath, "", newState as any);
    this.isStepNavigation = false;
  }

  private setupFormSubscriptions(): void {
    // Only set up subscriptions after initial load is complete
    this.stateFormGroup
      .get("stateCtrl")
      ?.valueChanges.subscribe((state: string) => {
        this.registeredAgentForm.get("state")?.setValue(state);
        this.addressForm.get("state")?.setValue(state);
      });

    Object.entries(this.formChangeFlags).forEach(([key, _]) => {
      const formGroup = this.getFormGroupByKey(key);
      formGroup?.valueChanges.subscribe(() => {
        this.formChangeFlags[key as keyof typeof this.formChangeFlags] = true;
      });
    });

    this.members.valueChanges.subscribe(() => this.calculateTotalOwnership());
  }

  private getFormGroupByKey(key: string): FormGroup | undefined {
    const formMap: { [key: string]: FormGroup } = {
      state: this.stateFormGroup,
      business: this.businessFormGroup,
      formationDate: this.formationDateFormGroup,
      businessDescription: this.businessDescriptionFormGroup,
      registeredAgent: this.registeredAgentForm,
      member: this.memberForm,
      manager: this.managerForm,
      address: this.addressForm,
      primaryContact: this.primaryContactForm,
      ein: this.einFormGroup,
      operatingAgreement: this.operatingAgreementFormGroup,
      expedited: this.expeditedFormGroup,
      management: this.managementFormGroup,
    };
    return formMap[key];
  }

  get members(): FormArray {
    return this.memberForm.get("members") as FormArray;
  }

  get managers(): FormArray {
    return this.managerForm.get("managers") as FormArray;
  }

  getMember(index: number): FormGroup {
    return this.members.at(index) as FormGroup;
  }

  getManager(index: number): FormGroup {
    return this.managers.at(index) as FormGroup;
  }

  private fetchStates(): void {
    this.formationService.getStates().subscribe({
      next: (data: string[]) => {
        this.states = data;

        const control = this.stateFormGroup.get("stateCtrl") as FormControl;
        control.setValidators([
          Validators.required,
          this.stateInListValidator.bind(this),
        ]);
        control.updateValueAndValidity();
      },
    });
  }

  private fetchPrincipalActivities(): void {
    this.formationService.getPrincipalActivities().subscribe({
      next: (data: any[]) => {
        this.principalActivities = data ?? [];
        // Initialize filteredPrincipalActivities
        const control = this.businessDescriptionFormGroup.get(
          "principalActivity"
        ) as FormControl;
        this.filteredPrincipalActivities = control.valueChanges.pipe(
          startWith(""),
          map((value) =>
            this._filterActivities(typeof value === "string" ? value : "")
          )
        );
      },
    });
  }

  private _filterActivities(value: string): string[] {
    if (!value) return this.principalActivities;
    const filterValue = value.toLowerCase();
    const filtered = this.principalActivities.filter((activity) =>
      activity.toLowerCase().includes(filterValue)
    );
    return filtered;
  }

  displayActivity(activity: string | null): string {
    return activity ?? "";
  }
  // inside FormationWizardComponent
  private stateInListValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const val = (control.value as string) || "";
    if (this.states.length === 0) return null; // defer until list loads
    return this.states.includes(val.trim()) ? null : { invalidState: true };
  };

  private filterStates(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.states.filter((state) =>
      state.toLowerCase().includes(filterValue)
    );
  }

  private fetchLLCSuffixes(): void {
    this.formationService.getLLCSuffixes().subscribe({
      next: (data: string[]) => (this.llcSuffixes = data),
    });
  }

  private fetchReasonForApplying(): void {
    this.formationService.getReasonForApplying().subscribe({
      next: (data: any[]) => (this.reasonForApplying = data),
      error: (err) => {
        console.error("Error fetching reasons:", err);
      },
    });
  }
  private loadSubCategoriesFromPrincipalActivity(): void {
    const actRaw =
      this.businessDescriptionFormGroup.get("principalActivity")?.value;

    // Optional: if no activity selected, clear and bail
    if (actRaw == null || (typeof actRaw === "string" && !actRaw.trim())) {
      this.subcategoryValue = [];
      return;
    }

    this.formationService.getPrincipalSubCategories(actRaw).subscribe({
      next: (list) => {
        this.subcategoryValue = Array.isArray(list) ? list : [];
      },
      error: () => {
        // Keep existing state or clear if you prefer
        this.subcategoryValue = [];
      },
    });
  }

  checkCompany(): void {
    // Only call if *state* or *business* changed
    if (!this.formChangeFlags.state && !this.formChangeFlags.business) {
      this.goToNextStep(this.stepper);
      return;
    }

    const state = (this.stateFormGroup.value.stateCtrl || "").trim();
    const companyName = (this.businessFormGroup.value.companyName || "").trim();
    const llc = (this.businessFormGroup.value.llcSuffix || "").trim();

    // Guard: required fields
    if (!state || !companyName) {
      this.snackBarService.showError("Please enter state and company name.");
      return;
    }

    this.loadingService.show("Checking Business Name Availability");
    this.formationService.checkCompanyName(state, companyName).subscribe({
      next: (response: CompanyCheckResponse) => {
        this.loadingService.hide();
        const isAvailable = response.message.includes("Not Found");

        if (isAvailable) {
          this.openTicketDialog(companyName, state, llc);
        } else {
          this.openDialog(
            "🚫 Name Unavailable",
            "The name you entered is unavailable. Please choose a different one to continue your registration.",
            false
          );
        }
        // NOTE: We do NOT reset formChangeFlags.state/business here,
        // so your save handlers can still use them.
      },
      error: () => {
        this.loadingService.hide();
        this.snackBarService.showError("Failed to check name availability.");
      },
    });
  }



openTermsDialog(formType: "regForm1" | "regForm3" | "regForm4"): void {
  this.loadingService.show("Loading Term & Conditions…");

  this.formationService.getTerms(formType).subscribe({
    next: (res) => {
      this.loadingService.hide();
      const termsText = res.content;

      this.dialog
        .open(TermsDialogComponent, {
          autoFocus: false,
          width: "600px",
          disableClose: true,
          data: { formType, termsText },
          enterAnimationDuration: "200ms",
          exitAnimationDuration: "200ms",
          backdropClass: "custom-ticket-dialog-backdrop",
        })
        .afterClosed()
        .subscribe((confirmed: boolean) => {
          if (confirmed) {
            console.log("User accepted terms for", formType);
            this.setStepAgreed(formType, true);
          } else {
            // User cancelled or closed dialog
            this.setStepAgreed(formType, false);
          }
        });
    },
    error: () => {
      this.loadingService.hide();
      console.error("Failed to load terms");
    },
  });
}

onTermsCheckboxClick(event: any, formType: "regForm1" | "regForm3" | "regForm4") {
  // Stop Angular from toggling the checkbox automatically
  if (formType === "regForm1") event.source.checked = this.isAgreedRegForm1;
  else if (formType === "regForm3") event.source.checked = this.isAgreedRegForm3;
  else if (formType === "regForm4") event.source.checked = this.isAgreedRegForm4;

  // Open the dialog
  this.openTermsDialog(formType);
}


setStepAgreed(
  formType: "regForm1" | "regForm3" | "regForm4",
  value: boolean
): void {
  if (formType === "regForm1") {
    if (this.isAgreedRegForm1 !== value) this.formChangeFlags.regForm1 = true;
    this.isAgreedRegForm1 = value;
  } else if (formType === "regForm3") {
    if (this.isAgreedRegForm3 !== value) this.formChangeFlags.regForm3 = true;
    this.isAgreedRegForm3 = value;
  } else if (formType === "regForm4") {
    if (this.isAgreedRegForm4 !== value) this.formChangeFlags.regForm4 = true;
    this.isAgreedRegForm4 = value;
  }
}

  private openDialog(title: string, message: string, isSuccess: boolean): void {
    const dialogRef = this.dialog.open(CompanyAvailabilityDialogComponent, {
      width: "320px",
      enterAnimationDuration: "200ms",
      exitAnimationDuration: "200ms",
      data: {
        title,
        message,
        isSuccess,
        saveStateAndCompanyName: isSuccess
          ? () => this.saveStateAndCompanyName()
          : undefined,
      },
      backdropClass: "custom-ticket-dialog-backdrop",
    });

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      if (result && isSuccess) {
        this.stepper.selectedIndex = 2;
      }
    });
  }

  private openPaymentConfirmationDialog(isPaymentSuccessful: boolean): void {
    const dialogRef = this.dialog.open(PaymentConfirmationDialogComponent, {
      width: "290px",
      data: {
        isSuccessful: isPaymentSuccessful,
      },
      backdropClass: "custom-ticket-dialog-backdrop",
    });

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      if (result) {
        this.stepper.selectedIndex = 12;
        this.isPaymentDone = true;
        this.updateUrlWithStepAndCompanyId(this.stepper.selectedIndex);
      }
    });
  }

  isNextDisabled(): boolean {
    return this.businessFormGroup.invalid;
  }

  onDateChange(): void {
    const control = this.formationDateFormGroup.get("formationDate");
    if (control) {
      control.markAsTouched();
      control.markAsDirty();
      control.updateValueAndValidity();
    }
  }

  // Add logic to submitLLCForm for regForm4
  // formation-wizard.component.ts

  submitLLCForm(formType: "regForm1" | "regForm3" | "regForm4"): void {
    const flagKey =
      formType === "regForm1"
        ? "regForm1"
        : formType === "regForm3"
        ? "regForm3"
        : "regForm4";

    const isAgreed =
      formType === "regForm1"
        ? this.isAgreedRegForm1
        : formType === "regForm3"
        ? this.isAgreedRegForm3
        : this.isAgreedRegForm4;

    // Nothing changed? Just move on.
    if (!this.formChangeFlags[flagKey]) {
      this.goToNextStep(this.stepper);
      return;
    }

    if (!isAgreed) {
      this.snackBarService.showError("Please accept the terms to continue.");
      return;
    }

    if (!this.checkCompanyId()) return;

    const einChosen =
      formType === "regForm3" ? Boolean(this.needEin) : undefined;

    this.loadingService.show("Submitting…");

    this.formationService
      .updateRegForm(formType, true, this.companyId!, einChosen)
      .subscribe({
        next: () => {
          this.loadingService.hide();

          const reviewText =
            formType === "regForm1"
              ? "Initial Review"
              : formType === "regForm3"
              ? "Final Review"
              : "Additional Review";

          this.snackBarService.showSuccess(
            `✔ ${reviewText} has been updated successfully!`,
            "Close"
          );

          this.formChangeFlags[flagKey] = false;

          if (formType === "regForm3") {
            this.launchedLLC = true;
            if (einChosen) {
              this.loadSubCategoriesFromPrincipalActivity();
            }

            // *** NEW AUTOFOCUS LOGIC INTEGRATED HERE ***

            // Delay the step transition to ensure state updates are processed.
            setTimeout(() => {
              this.goToNextStep(this.stepper);

              // After moving to the next step, wait for the view to render.
              setTimeout(() => {
                if (einChosen) {
                  const targetId = "ssnItinInput";
                  const element = document.getElementById(targetId);

                  // Focus the element only if it exists and is empty, as requested.
                  if (
                    element &&
                    element instanceof HTMLInputElement &&
                    element.value.trim() === ""
                  ) {
                    element.focus();
                    element.select();
                  }
                }
              }, 150); // 150ms delay for the DOM to update.
            }, 500);
          } else {
            // Original behavior for other form types.
            setTimeout(() => this.goToNextStep(this.stepper), 500);
          }
        },
        error: () => {
          this.loadingService.hide();
        },
      });
  }

  addMember(): void {
    const newMember = this.createCleanMemberFormGroup();
    this.members.push(newMember);
    this.calculateTotalOwnership();
    this.cdr.detectChanges();
    setTimeout(() => {
      this.memberStepper.selectedIndex = this.members.length - 1;
      newMember.patchValue({ _adding: false }, { emitEvent: false });
    }, 300);
  }

  removeMember(index: number): void {
    if (this.members.length > 1) {
      // If removing the EIN responsible party, clear the selection
      if (this.selectedEinResponsiblePartyIndex === index) {
        this.selectedEinResponsiblePartyIndex = null;
      } else if (
        this.selectedEinResponsiblePartyIndex !== null &&
        this.selectedEinResponsiblePartyIndex > index
      ) {
        // Adjust the index if removing a member before the selected one
        this.selectedEinResponsiblePartyIndex--;
      }

      // Mark as removing (for animation)
      (this.members.at(index) as FormGroup).patchValue(
        { _removing: true },
        { emitEvent: false }
      );

      setTimeout(() => {
        this.members.removeAt(index);
        this.calculateTotalOwnership();
      }, 300);
    }
  }

  addManager(): void {
    const newManager = this.createCleanManagerFormGroup();
    this.managers.push(newManager);
    this.cdr.detectChanges();
    setTimeout(() => {
      this.managerStepper.selectedIndex = this.managers.length - 1;
      newManager.patchValue({ _adding: false }, { emitEvent: false });
    }, 300);
  }

  removeManager(index: number): void {
    if (this.managers.length > 1) {
      (this.managers.at(index) as FormGroup).patchValue(
        { _removing: true },
        { emitEvent: false }
      );
      setTimeout(() => {
        this.managers.removeAt(index);
      }, 300);
    }
  }

  public calculateTotalOwnership(): void {
    this.totalOwnership = this.members.controls.reduce(
      (total, member) => total + (Number(member.get("ownership")?.value) || 0),
      0
    );
  }

  isMemberFormValid(): boolean {
    const isBasicFormValid =
      this.members.controls.every((m) => m.valid) &&
      this.totalOwnership === 100;

    if (this.needEin) {
      // Only check if responsible party is selected, not SSN validation
      const hasEinResponsibleParty =
        this.selectedEinResponsiblePartyIndex !== null;
      return isBasicFormValid && hasEinResponsibleParty;
    }

    return isBasicFormValid;
  }

  areAllMembersValid(): boolean {
    return this.members.controls.every((member) => member.valid);
  }

  isManagerFormValid(): boolean {
    return (
      this.managers.controls.every((manager) => manager.valid) &&
      this.managers.length > 0
    );
  }

  areAllManagersValid(): boolean {
    return this.managers.controls.every((manager) => manager.valid);
  }

  goToNextStep(stepper: MatStepper): void {
    // if(stepper.selectedIndex === 13 && this.managementStyle === 'manager'){
    //   this.members.clear();
    //   const newMember = this.createCleanMemberFormGroup();
    //   this.members.push(newMember);
    // }
    if (this.isPaymentDone && stepper.selectedIndex === 6) {
      stepper.selectedIndex = 12;
    } else {
      stepper.next();
    }
    if (
      (stepper.selectedIndex === 16 || stepper.selectedIndex === 17) &&
      this.needEin &&
      this.selectedEinResponsiblePartyIndex !== null
    ) {
      this.populateEinApplicationForm();
    }
    this.activeStepIndex = stepper.selectedIndex;
    this.updateStepContentVisibility(stepper);
    this.updateUrlWithStepAndCompanyId(this.activeStepIndex);
  }

  goToPreviousStep(stepper: MatStepper): void {
    if (this.isPaymentDone && stepper.selectedIndex === 12) {
      stepper.selectedIndex = 6;
    } else {
      stepper.previous();
    }
    this.activeStepIndex = stepper.selectedIndex;
    this.updateStepContentVisibility(stepper);
    this.updateUrlWithStepAndCompanyId(this.activeStepIndex);
  }

  private updateStepContentVisibility(stepper: MatStepper): void {
    this.hideStepContent = this.isPaymentDone && stepper.selectedIndex === 6;
    this.hidePrevButton = this.hideStepContent;
  }

  private toggleAddressFields(
    formGroup: FormGroup,
    enable: boolean,
    stateValue?: string
  ): void {
    const fields = ["streetAddress1", "streetAddress2", "city", "zipCode"];
    fields.forEach((field) =>
      formGroup.get(field)?.[enable ? "enable" : "disable"]()
    );
    if (enable) {
      formGroup.reset();
      if (stateValue) {
        formGroup.get("state")?.setValue(stateValue);
      }
    }
  }

  private patchAddressForm(
    formGroup: FormGroup,
    data: AgentDetails,
    stateValue: string
  ): void {
    formGroup.patchValue({
      streetAddress1: data.streetAddress1,
      streetAddress2: data.streetAddress2,
      city: data.city,
      state: stateValue,
      zipCode: data.zipCode,
    });
  }

  onFirstNameFocus(event: FocusEvent): void {
    if (!this.hasDialogOpened) {
      this.hasDialogOpened = true;

      const inputElement = event?.target as HTMLElement;

      const dialogRef = this.dialog.open(this.secureDialog, {
        width: "600px",
        disableClose: true,
        autoFocus: false,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          this.registeredAgentForm.patchValue({ useagentAddress: true });
          this.toggleAgentAddress(true);
        } else {
          inputElement.blur();
        }
      });
    }
  }

  toggleAgentAddress(useAgentAddress: boolean): void {
    const stateValue = this.stateFormGroup.value.stateCtrl;
    if (useAgentAddress) {
      this.formationService.getAgentDetails(stateValue).subscribe({
        next: (data: AgentDetails) => {
          this.registeredAgentForm.patchValue({
            firstName: data.firstName,
            lastName: data.lastName,
            streetAddress1: data.streetAddress1,
            streetAddress2: data.streetAddress2,
            city: data.city,
            state: stateValue,
            zipCode: data.zipCode,
          });
          [
            "firstName",
            "lastName",
            "streetAddress1",
            "streetAddress2",
            "state",
            "city",
            "zipCode",
          ].forEach((field) => this.registeredAgentForm.get(field)?.disable());
        },
      });
    } else {
      this.registeredAgentForm.reset();
      this.registeredAgentForm.get("state")?.setValue(stateValue);

      [
        "firstName",
        "lastName",
        "streetAddress1",
        "streetAddress2",
        "city",
        "zipCode",
      ].forEach((field) => this.registeredAgentForm.get(field)?.enable());
    }
  }

  toggleAddress(useOurAddress: boolean): void {
    const stateValue = this.stateFormGroup.value.stateCtrl;
    if (useOurAddress) {
      this.useAddress = true;
      this.formationService.getAgentDetails(stateValue).subscribe({
        next: (data: AgentDetails) => {
          this.patchAddressForm(this.addressForm, data, stateValue);
          this.toggleAddressFields(this.addressForm, false);
        },
        error: (err: { message: string }) => {
          this.snackBarService.showError(
            err.message || "Failed to fetch address details"
          );
        },
      });
    } else {
      this.toggleAddressFields(this.addressForm, true, stateValue);
    }
  }

  toggleMemberAddress(index: number, useDefault: boolean): void {
    const memberGroup = this.members.at(index) as FormGroup;
    const addressGroup = memberGroup.get("address") as FormGroup;
    memberGroup.get("useAddress")?.setValue(useDefault, { emitEvent: false });
    const stateValue = this.stateFormGroup.value.stateCtrl;

    if (useDefault) {
      if (!stateValue) {
        this.snackBarService.showError("No state value provided.");
        return;
      }
      this.formationService.getAgentDetails(stateValue).subscribe({
        next: (data: AgentDetails) => {
          this.patchAddressForm(addressGroup, data, stateValue);
          this.toggleAddressFields(addressGroup, false);
          addressGroup.get("state")?.disable();
        },
        error: (err: { message: string }) => {
          this.snackBarService.showError(
            err.message || "Failed to fetch member address details"
          );
        },
      });
    } else {
      this.toggleAddressFields(addressGroup, true);
      addressGroup.get("state")?.enable();
    }
  }

  toggleManagerAddress(index: number, useDefault: boolean): void {
    const managerGroup = this.managers.at(index) as FormGroup;
    const addressGroup = managerGroup.get("managerAddress") as FormGroup;
    managerGroup
      .get("useAddress_1")
      ?.setValue(useDefault, { emitEvent: false });
    const stateValue = this.stateFormGroup.value.stateCtrl;

    if (useDefault) {
      if (!stateValue) {
        this.snackBarService.showError("No state value provided.");
        return;
      }
      this.formationService.getAgentDetails(stateValue).subscribe({
        next: (data: AgentDetails) => {
          this.patchAddressForm(addressGroup, data, stateValue);
          this.toggleAddressFields(addressGroup, false);
          addressGroup.get("state")?.disable();
        },
        error: (err: { message: string }) => {
          this.snackBarService.showError(
            err.message || "Failed to fetch manager address details"
          );
        },
      });
    } else {
      this.toggleAddressFields(addressGroup, true);
      addressGroup.get("state")?.enable();
    }
  }

  finishProcess(): void {
    // sessionStorage.removeItem("managementStyle");
    // sessionStorage.removeItem("needEin");
    this.router.navigate(["/dashboard"]);
  }

  private updateCompanyId(response: any): void {
    if (response.companyId) {
      localStorage.setItem("company_id", response.companyId);
      this.companyId = +response.companyId;
    }
  }

  private checkCompanyId(): boolean {
    if (!this.companyId) {
      this.snackBarService.showError("No company ID found.");
      return false;
    }
    return true;
  }

  private handleFormValidation(formGroup: FormGroup): boolean {
    //this.openTicketDialog("companyName", "state", "llc");
    if (!formGroup.valid) {
      console.warn("Form is invalid. Please fill in all required fields.");
      return false;
    }
    return true;
  }

  // Save state
  saveState(): void {
    if (
      !this.formChangeFlags.state ||
      !this.handleFormValidation(this.stateFormGroup)
    )
      return;
    const stateData: CompanyFormationState & {
      loginUserId: string;
      companyId: string;
    } = {
      state: this.stateFormGroup.get("stateCtrl")?.value || "",
      loginUserId: localStorage.getItem("login_user_id") || "null",
      companyId: this.companyId?.toString() || "null",
    };
    this.formationService.saveState(stateData).subscribe({
      next: (response) => {
        this.updateCompanyId(response);
        this.formChangeFlags.state = false;
      },
    });
  }
  openTicketDialog(name: string, state: string, entity: string) {
    this.dialog
      .open(BusinessNameCheckDialogComponent, {
        panelClass: "custom-dialog-panel",
        data: {
          name,
          state,
          entity,
          saveStateAndCompanyName: () => this.saveStateAndCompanyName(), // Changed this line
        },
        backdropClass: "custom-ticket-dialog-backdrop",
        width: "auto",
        maxWidth: "auto",
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result: { proceed: boolean; focusTarget: string } | any) => {
        // Check if we should proceed
        if (result && result.proceed) {
          // 1. Move the stepper to the correct step
          this.stepper.selectedIndex = 2;

          // 2. Use a timeout to focus on the target element after the view renders
          setTimeout(() => {
            const element = document.getElementById(result.focusTarget);
            if (element) {
              element.focus();
            }
          }, 150); // A short delay ensures the step is visible
        }
      });
  }

  saveStateAndCompanyName(): void {
    if (this.isSaving) return; // block duplicate clicks
    this.isSaving = true;

    if (
      !this.handleFormValidation(this.stateFormGroup) ||
      !this.handleFormValidation(this.businessFormGroup)
    ) {
      this.isSaving = false; // reset flag on invalid form
      return;
    }

    this.loadingService.show("Loading...");

    const stateData: CompanyFormationState & {
      loginUserId: string;
      companyId: string;
    } = {
      state: this.stateFormGroup.get("stateCtrl")?.value || "",
      loginUserId: localStorage.getItem("login_user_id") || "null",
      companyId: this.companyId?.toString() || "null",
    };

    this.formationService.saveState(stateData).subscribe({
      next: (stateResponse) => {
        this.updateCompanyId(stateResponse);
        this.formChangeFlags.state = false;

        if (this.companyId) {
          const companyData: CompanyNameDetails = {
            companyName: this.businessFormGroup.get("companyName")?.value || "",
            llcSuffix: this.businessFormGroup.get("llcSuffix")?.value || "",
          };

          this.formationService
            .saveCompanyName(this.companyId, companyData)
            .subscribe({
              next: (companyResponse) => {
                this.updateCompanyId(companyResponse);
                this.breadcrumbService.updateCompanyData(
                  `${companyData.companyName} ${companyData.llcSuffix}`,
                  this.stateFormGroup.get("stateCtrl")?.value || ""
                );
                this.formChangeFlags.business = false;
                this.activeStepIndex = this.stepper.selectedIndex;
                this.updateUrlWithStepAndCompanyId(this.activeStepIndex);
                this.loadingService.hide();
                this.isSaving = false; // ✅ reset flag after success
              },
              error: () => {
                this.snackBarService.showError("Failed to save company name");
                this.loadingService.hide();
                this.isSaving = false; // ✅ reset flag on error
              },
            });
        }
      },
      error: () => {
        this.snackBarService.showError("Failed to save state");
        this.loadingService.hide();
        this.isSaving = false; // ✅ reset flag on error
      },
    });
  }

  // Save company name

  // Save formation date
  saveFormationDate(): void {
    if (
      !this.formChangeFlags.formationDate ||
      !this.handleFormValidation(this.formationDateFormGroup) ||
      !this.checkCompanyId()
    )
      return;
    const formationDate: FormationDate = {
      formationDate:
        this.datePipe.transform(
          this.formationDateFormGroup.get("formationDate")?.value,
          "yyyy-MM-dd"
        ) || null,
    };
    this.formationService
      .saveFormationDate(this.companyId!, formationDate.formationDate!)
      .subscribe({
        next: (response) => {
          this.updateCompanyId(response);
          this.formChangeFlags.formationDate = false;
        },
      });
  }

  // Save business description
  saveFormationDetails(): void {
    if (
      !this.formChangeFlags.businessDescription ||
      !this.handleFormValidation(this.businessDescriptionFormGroup) ||
      !this.checkCompanyId()
    )
      return;

    const payload: BusinessDescription = {
      companyId: this.companyId!,
      businessDescription:
        this.businessDescriptionFormGroup.get("businessDescription")?.value ||
        "",
      tradeName:
        this.businessDescriptionFormGroup.get("tradeName")?.value || "",
      principalActivity:
        this.businessDescriptionFormGroup.get("principalActivity")?.value || "",
    };

    this.formationService.saveFormationDetails(payload).subscribe({
      next: (response) => {
        this.updateCompanyId(response);
        this.formChangeFlags.businessDescription = false;
      },
      error: () => {
        this.snackBarService.showError("Failed to save business description");
      },
    });
  }

  // Save EIN service
  saveEinService(): void {
    if (!this.checkCompanyId()) return;

    // Always save the EIN service, regardless of dirty state
    const einData: EINDetails = {
      EIN: this.einFormGroup.get("EIN")?.value || false,
    };
    sessionStorage.setItem("needEin", String(einData.EIN));
    this.formationService
      .saveEinService(this.companyId!, einData.EIN)
      .subscribe({
        next: (response) => {
          this.updateCompanyId(response);
          this.formChangeFlags.ein = false;
        },
      });
  }

  // Save operating agreement service
  saveOperatingAgreementService(): void {
    if (!this.checkCompanyId()) return;

    // Always save the Operating Agreement service, regardless of dirty state
    const oaData: OperatingAgreementDetails = {
      OA: this.operatingAgreementFormGroup.get("OA")?.value || false,
    };

    this.formationService
      .saveOperatingAgreementService(this.companyId!, oaData.OA)
      .subscribe({
        next: (response) => {
          this.updateCompanyId(response);
          this.formChangeFlags.operatingAgreement = false;
        },
      });
  }

  // Save expedited service
  saveExpediteService(): Observable<any> {
    if (!this.checkCompanyId()) return of(null);

    // Always save the Expedited service, regardless of dirty state
    const expedited = this.expeditedFormGroup.get("Expedit")?.value || false;

    return this.formationService
      .saveExpediteService(this.companyId!, expedited)
      .pipe(
        tap((response) => this.updateCompanyId(response)),
        tap(() => (this.formChangeFlags.expedited = false))
      );
  }

  handleExpediteNext(): void {
    if (!this.checkCompanyId()) {
      this.snackBarService.showError("Company ID is missing.");
      return;
    }

    // Trigger saveExpediteService regardless of formChangeFlags
    this.isSavingExpedited = true;
    this.saveExpediteService().subscribe({
      next: () => {
        // Always fetch payment charges after saving expedite
        this.fetchPaymentCharges();
        this.goToNextStep(this.stepper); // Proceed to the next step
        this.isSavingExpedited = false;
      },
      error: (err) => {
        this.snackBarService.showError(
          err?.message || "Failed to save expedite service"
        );
        this.isSavingExpedited = false;
      },
    });
  }

  // Fetch payment charges
  private fetchPaymentCharges(): void {
    if (!this.checkCompanyId()) return;
    this.formationService.getPaymentCharges(this.companyId!).subscribe({
      next: (charges) => {
        this.stateFee = charges.stateFee;
        this.einFee = charges.fileForEin;
        this.agreementFee = charges.operatingAgreement;
        this.expeditedFee = charges.expediteRequired;
        this.registerAgentFee = charges.registerAgentFee;
        this.totalCharges = charges.totalCharges;
      },
    });
  }

  // Save registered agent
  saveRegisteredAgent(): void {
    if (
      !this.checkCompanyId() ||
      !this.formChangeFlags.registeredAgent ||
      !this.handleFormValidation(this.registeredAgentForm)
    )
      return;
    const agentData: RegisteredAgentDetails =
      this.registeredAgentForm.getRawValue();
    const useAgent =
      this.registeredAgentForm.get("useagentAddress")?.value ?? false;
    this.formationService
      .saveRegisteredAgent(this.companyId!, agentData, useAgent)
      .subscribe({
        next: (response) => {
          this.updateCompanyId(response);
          this.formChangeFlags.registeredAgent = false;
        },
      });
  }

  // Save primary contact
  savePrimaryContact(): void {
    if (
      !this.formChangeFlags.primaryContact ||
      !this.checkCompanyId() ||
      !this.handleFormValidation(this.primaryContactForm)
    )
      return;
    const contactData: PrimaryContactDetails =
      this.primaryContactForm.getRawValue();
    this.formationService
      .savePrimaryContact(this.companyId!, contactData)
      .subscribe({
        next: (response) => {
          this.updateCompanyId(response);
          this.formChangeFlags.primaryContact = false;
        },
      });
  }
  getManagementStyleFromSessionStorage(): string | null {
    return sessionStorage.getItem("managementStyle");
  }
  getNeedEin(): boolean {
    return sessionStorage.getItem("needEin") === "true";
  }

  saveManagementStyle(): void {
    this.choosingManagementStyle = true;
    if (
      !this.handleFormValidation(this.managementFormGroup) ||
      !this.checkCompanyId()
    ) {
      this.choosingManagementStyle = false; // Bug Fix: Ensure spinner stops on invalid form
      return;
    }

    const style = this.managementFormGroup.get("management")!.value as
      | "member"
      | "manager";

    this.formationService
      .saveManagementStyle(this.companyId!, style)
      .subscribe({
        next: (response) => {
          this.updateCompanyId(response);
          sessionStorage.setItem("managementStyle", style);

          this.goToNextStep(this.stepper);

          // *** NEW AUTOFOCUS LOGIC STARTS HERE ***
          // This runs after the stepper moves to the next page.
          setTimeout(() => {
            // Determine the correct ID based on the selected style
            const targetId =
              style === "manager" ? "managerFirstName_0" : "memberFirstName_0";

            const element = document.getElementById(targetId);

            // Focus the element only if it exists and is empty
            if (
              element &&
              element instanceof HTMLInputElement &&
              element.value.trim() === ""
            ) {
              element.focus();
              element.select();
            }
          }, 150); // 150ms delay for the next step's view to render
          // *** NEW AUTOFOCUS LOGIC ENDS HERE ***

          this.choosingManagementStyle = false;
        },
        error: () => {
          this.snackBarService.showError("Failed to save management style");
          this.choosingManagementStyle = false;
        },
      });
  }
  saveMemberData(): void {
    if (
      !this.handleFormValidation(this.memberForm) ||
      !this.formChangeFlags.member ||
      !this.checkCompanyId()
    )
      return;

    const membersArray = this.memberForm.get("members") as FormArray;
    const raw: any[] = membersArray.getRawValue();

    // Build payload *without* einTaxId:
    const memberData: MemberDetails[] = raw.map((mbr) => ({
      firstName: mbr.firstName,
      lastName: mbr.lastName,
      email: mbr.email,
      phoneNumber: mbr.phoneNumber,
      ownership: mbr.ownership,
      useAddress: mbr.useAddress || false,
      isEinResponsibleParty: mbr.isEinResponsibleParty || false,
      streetAddress1: mbr.address?.streetAddress1,
      streetAddress2: mbr.address?.streetAddress2 || "",
      city: mbr.address?.city,
      state: mbr.address?.state,
      zipCode: mbr.address?.zipCode,
      country: mbr.address?.country || "USA",
    }));

    // query-param only
    const resp = raw.find((m) => m.isEinResponsibleParty);
    // const ssnId = resp?.einTaxId?.trim() || null;

    this.formationService
      .saveMemberData(this.companyId!, memberData)
      .subscribe({
        next: (res) => {
          this.updateCompanyId(res);
          this.formChangeFlags.member = false;
        },
      });
  }

  // Save manager data
  saveManagerData(): void {
    if (
      !this.formChangeFlags.manager ||
      !this.handleFormValidation(this.managerForm) ||
      !this.checkCompanyId()
    )
      return;
    const managersArray = this.managerForm.get("managers") as FormArray;
    const managerData: ManagerDetails[] = managersArray
      .getRawValue()
      .map((mgr: any) => ({
        firstName: mgr.firstName || "",
        lastName: mgr.lastName || "",
        email: mgr.email || "",
        phoneNumber: mgr.phoneNumber || "",
        useAddress: mgr.useAddress_1 || false,
        streetAddress1: mgr.managerAddress?.streetAddress1 || "",
        streetAddress2: mgr.managerAddress?.streetAddress2 || "",
        city: mgr.managerAddress?.city || "",
        state: mgr.managerAddress?.state || "",
        zipCode: mgr.managerAddress?.zipCode || "",
        country: mgr.managerAddress?.country || "USA",
      }));
    this.formationService
      .saveManagerData(this.companyId!, managerData)
      .subscribe({
        next: (response) => {
          this.updateCompanyId(response);
          this.formChangeFlags.manager = false;
        },
      });
  }

  // Save mailing address
  saveMailingAttributes(): void {
    if (!this.formChangeFlags.address || !this.checkCompanyId()) return;
    const mailingData: MailingAddress = {
      useAddress: this.addressForm.get("useOurAddress")?.value || false,
      streetAddress1: this.addressForm.get("streetAddress1")?.value || "",
      streetAddress2: this.addressForm.get("streetAddress2")?.value || "",
      city: this.addressForm.get("city")?.value || "",
      state: this.addressForm.get("state")?.value || "",
      zipCode: this.addressForm.get("zipCode")?.value || "",
    };
    this.formationService
      .saveMailingAttributes(this.companyId!, mailingData)
      .subscribe({
        next: (response) => {
          this.updateCompanyId(response);
          this.formChangeFlags.address = false;
        },
      });
  }

  // Initiate payment
  initiatePayment(): void {
    const companyName = this.businessFormGroup.get("companyName")?.value || "";
    this.formationService
      .createPaymentIntent(
        this.totalCharges,
        companyName,
        this.tokenService.getEmail() || ""
      )
      .subscribe({
        next: (response) => {
          this.clientSecret = response.clientSecret;
          this.paymentInitiated = true;
          this.setupStripe();
        },
      });
  }

  // Setup Stripe
  private setupStripe(): void {
    if (!this.clientSecret) {
      this.snackBarService.showError("Client secret not available");
      return;
    }

    const appearance = {
      theme: "flat",
      variables: {
        colorPrimary: "#ec3252", // from $primary-color
        colorPrimaryText: "#ffffff",
        colorBackground: "#ffffff", // $color-bg-white
        colorText: "#1a202c", // $color-text-main
        colorTextSecondary: "#64748b", // $color-text-muted
        colorDanger: "#df1b41",
        colorSuccess: "#166534",
        colorBackgroundSecondary: "#f8fafc", // $color-bg-light
        colorBorder: "#f1f5f9", // $color-border
        colorIcon: "#475569",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSizeBase: "16px",
        borderRadius: "12px",
        spacingUnit: "6px",
      },
      rules: {
        ".Input": {
          border: "1px solid #e2e8f0",
          boxShadow: "none",
          padding: "12px 14px",
        },
        ".Input:focus": {
          border: "1px solid #ec3252",
          boxShadow: "0 0 0 2px rgba(236,50,82,0.15)",
        },
        ".Label": {
          fontWeight: "500",
          color: "#121b33",
        },
        ".Tab": {
          border: "1px solid #f1f5f9",
          backgroundColor: "#f8fafc",
        },
        ".Tab--selected": {
          borderColor: "#ec3252",
          backgroundColor: "#ffd1dc", // $secondary-color
          color: "#ec3252",
        },
        ".Error": { color: "#df1b41" },
        ".Success": { color: "#166534" },
      },
    } as const;

    const elementsOptions: StripeElementsOptions = {
      clientSecret: this.clientSecret,
      appearance,
    };

    loadStripe(
      "pk_test_51R1SyS2fkGxBT2QDLZCZ0dk0FKvgPoITiVHcjNNf3FOmoAcDdRuzNCGcg5XXhNvH6npWiXXTIXzHmxbucUO9tGpc00AGfMr9hn"
    )
      .then((stripe) => {
        if (stripe) {
          this.stripeInstance = stripe;
          this.stripeElements = stripe.elements(elementsOptions);
          const paymentElement = this.stripeElements.create("payment");
          paymentElement.mount("#payment-form-container");
        }
      })
      .catch((error) =>
        this.snackBarService.showError("Error loading Stripe: " + error.message)
      );
  }

  async handlePayment(): Promise<void> {
    if (!this.stripeInstance || !this.stripeElements) {
      this.snackBarService.showError(
        "Stripe instance or elements not initialized"
      );
      return;
    }
    this.loadingService.show("Confirming payment");
    try {
      const result = await this.stripeInstance.confirmPayment({
        elements: this.stripeElements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });

      this.loadingService.hide();

      if (result.error) {
        this.handlePaymentStatus(
          "requires_payment_method",
          result.error.message
        );
        return;
      }
      if (result.paymentIntent) {
        this.loadingService.show("Processing payment ");
        if (result.paymentIntent.status === "succeeded") {
          this.savePayment(result).subscribe({
            next: (resp) => {
              this.loadingService.hide();
              this.handlePaymentStatus(result.paymentIntent.status);

              console.log("✅ Payment persisted successfully:", resp);
            },
            error: (err) => console.error("❌ Failed to persist payment:", err),
          });
        }
      }
    } catch (error: any) {
      this.loadingService.hide();
      this.snackBarService.showError(
        "Error confirming payment: " + error.message
      );
    }
  }

  private handlePaymentStatus(status: string, errorMessage?: string): void {
    this.loadingService.show("Finalizing Payment");
    this.paymentStatus = status;
    console.log("Payment status:", status);

    this.isPaymentSuccessful = status === "succeeded";

    if (status === "succeeded") {
      this.updateRegForm2(true).subscribe(
        () => {
          this.loadingService.hide();
          this.openPaymentConfirmationDialog(true);
        },
        (err) => console.error("Update failed", err)
      );
    } else if (status === "processing") {
      this.snackBarService.showError(
        "Your payment is processing. We will update you once it is complete."
      );
      this.loadingService.hide();
      this.openPaymentConfirmationDialog(false);
    } else {
      this.snackBarService.showError(
        errorMessage || "Payment could not be completed."
      );
      // this.updateRegForm2(false);
      this.loadingService.hide();
      this.openPaymentConfirmationDialog(false);
    }
  }
  private savePayment(paymentData: any): Observable<any> {
    if (!this.checkCompanyId()) return of(null);

    return this.formationService.savePaymentData(paymentData, this.companyId!);
  }

  private updateRegForm2(status: boolean) {
    if (!this.checkCompanyId()) return of(null);

    return this.formationService.updateRegForm2(status, this.companyId!);
  }

  // Check payment status
  private checkPaymentStatus(): void {
    if (!this.paymentIntentId) return;
    this.formationService.checkPaymentStatus(this.paymentIntentId).subscribe({
      next: (response) => {
        this.paymentStatus = response.status;
      },
    });
  }

  // Delete manager service
  deleteManagerService(): void {
    if (
      this.managementFormGroup.get("management")?.value !== "member" ||
      !this.formChangeFlags.management ||
      !this.checkCompanyId()
    )
      return;
    this.formationService.deleteManager(this.companyId!).subscribe({
      next: (response) => {
        this.updateCompanyId(response);
        this.formChangeFlags.management = false;
      },
    });
  }

  // In the populateEinApplicationForm method, update this section:
  populateEinApplicationForm(): void {
    if (this.selectedEinResponsiblePartyIndex === null) return;

    const responsibleParty = this.getMember(
      this.selectedEinResponsiblePartyIndex
    );
    const companyName = this.businessFormGroup.get("companyName")?.value || "";
    const llcSuffix = this.businessFormGroup.get("llcSuffix")?.value || "";
    const tradeName =
      this.businessDescriptionFormGroup.get("tradeName")?.value || "";
    const primaryActivity =
      this.businessDescriptionFormGroup.get("principalActivity")?.value || "";

    // Get responsible member's address for mailing pre-population
    const memberAddress = responsibleParty.get("address");

    this.einApplicationForm.patchValue({
      responsiblePartyName: `${responsibleParty.get("firstName")?.value} ${
        responsibleParty.get("lastName")?.value
      }`,
      llcName: `${companyName} ${llcSuffix}`,
      numberOfMembers: this.members.length.toString(),
      tradeName: tradeName,
      primaryActivity: primaryActivity,
      formationDate: this.formationDateFormGroup.get("formationDate")?.value,
      businessStreetAddress: this.addressForm.get("streetAddress1")?.value,
      businessCity: this.addressForm.get("city")?.value,
      businessState: this.addressForm.get("state")?.value,
      businessZipCode: this.addressForm.get("zipCode")?.value,
      // Pre-populate mailing address with responsible member's address
      mailingStreetAddress: memberAddress?.get("streetAddress1")?.value || "",
      mailingCity: memberAddress?.get("city")?.value || "",
      mailingState: memberAddress?.get("state")?.value || "",
      mailingZipCode: memberAddress?.get("zipCode")?.value || "",
    });

    // Set the checkbox to control mailing address visibility
    this.einApplicationForm.patchValue({
      usePhysicalAddressForMailing: this.usePhysicalAddressForMailing,
    });
  }
  // Add method to handle checkbox change
  onMailingAddressCheckboxChange(checked: boolean): void {
    this.usePhysicalAddressForMailing = checked;
    this.isDifferentMailingAddress = !checked; // Show mailing fields when unchecked

    if (!checked && this.selectedEinResponsiblePartyIndex !== null) {
      // Pre-populate with responsible member's address when showing mailing fields
      const responsibleParty = this.getMember(
        this.selectedEinResponsiblePartyIndex
      );
      const memberAddress = responsibleParty.get("address");

      this.einApplicationForm.patchValue({
        mailingStreetAddress: memberAddress?.get("streetAddress1")?.value || "",
        mailingCity: memberAddress?.get("city")?.value || "",
        mailingState: memberAddress?.get("state")?.value || "",
        mailingZipCode: memberAddress?.get("zipCode")?.value || "",
      });
    }
  }
  // 4) ADD / REPLACE the submit method (no mailing override logic)
  submitEinApplication(): void {
    if (this.einApplicationForm.invalid) {
      this.einApplicationForm.markAllAsTouched();
      return;
    }
    // Format to YYYY-MM-DD
    const toYmd = (d: any) => {
      const date = d instanceof Date ? d : new Date(d);
      return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
    };

    console.log(
      "Submitting EIN Application Form:",
      this.einApplicationForm.value
    );
    const f = this.einApplicationForm.value as any;

    const payload = {
      companyId: Number(this.companyId ?? 0),

      // LLC info
      llcName: f.llcName ?? "",
      tradeName: f.tradeName ?? "",
      numberOfMembers: Number(f.numberOfMembers ?? 0),

      // Responsible Party
      responsiblePartyName: f.responsiblePartyName ?? "",
      ssnId: f.ssnItin ?? "", // map ssnItin → ssnId

      // Address Info
      mailingStreetAddress: f.mailingStreetAddress ?? "",
      mailingCity: f.mailingCity ?? "",
      mailingState: f.mailingState ?? "",
      mailingZipCode: f.mailingZipCode ?? "",
      businessStreetAddress: f.businessStreetAddress ?? "",
      businessCity: f.businessCity ?? "",
      businessState: f.businessState ?? "",
      businessZipCode: f.businessZipCode ?? "",
      usePhysicalAddressForMailing: !!f.usePhysicalAddressForMailing,

      // Business Info
      principalActivity: f.primaryActivity ?? "",
      principalSubActivity: f.principalSubActivity ?? "",
      reasonForApplyingId: Number(f.reasonForApplying ?? 0),
      formationDate: toYmd(f.formationDate), // "YYYY-MM-DD"
      closingMonth: f.closingMonth ?? "",
      // Employees
      hireEmployeeIn12Months: !!f.hireEmployeeIn12Months,
      firstWageDate: toYmd(f.firstWageDate),
      householdEmployees: Number(f.householdEmployees ?? 0),
      agriculturalEmployees: Number(f.agriculturalEmployees ?? 0),
      otherEmployees: Number(f.otherEmployees ?? 0),
      // Yes/No flags
      husbandWifeMembers: !!f.husbandWifeMembers,
      sellsAlcoholTobaccoFirearms: !!f.sellsAlcoholTobaccoFirearms,
      fileAnnualPayrollTaxes: !!f.fileAnnualPayrollTaxes,
      involvesGambling: !!f.involvesGambling,
      ownsHeavyVehicle: !!f.ownsHeavyVehicle,
      paysFederalExciseTaxes: !!f.paysFederalExciseTaxes,

      llcType: f.LLCType ?? "",
      previousFederalTaxId: f.previousFederalTaxId ?? "",
      // Authorization Info
      phoneNumber: f.phoneNumber ?? "",
      email: f.email ?? "",
    };

    this.loadingService.show("Submitting EIN Application...");
    this.formationService.saveEinDetails(payload).subscribe({
      next: () => {
        console.log(payload);
        this.submitLLCForm("regForm4");
        this.loadingService.hide();
        this.snackBarService.showSuccess(
          "EIN details saved successfully!",
          "Close"
        );
        // this.goToNextStep(this.stepper);

        // optional: navigate next step or show success
        // this.goToNextStep(this.stepper);
      },
      error: () => {
        this.loadingService.hide();
      },
    });
  }

  private setupCheckboxWatcher(parentKey: string, childKeys: string[]): void {
    const parentCtrl = this.einApplicationForm.get(parentKey);
    if (!parentCtrl) return;

    parentCtrl.valueChanges.subscribe((checked: boolean) => {
      childKeys.forEach((key) => {
        const ctrl = this.einApplicationForm.get(key);
        if (!ctrl) return;

        if (checked) {
          ctrl.setValidators([Validators.required]);
          ctrl.markAsUntouched();
          ctrl.markAsPristine();
        } else {
          ctrl.reset(null, { emitEvent: false });
          ctrl.clearValidators();
        }
        ctrl.updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  // Method to mask SSN display
  // maskSSN(ssn: string): string {
  //   if (!ssn) return '';
  //   return `***-**-${ssn.slice(-4)}`;
  // }
}
