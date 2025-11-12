// import {
//   FormBuilder,
//   FormGroup,
//   FormArray,
//   Validators,
//   FormControl,
//   AbstractControl,
//   ValidationErrors
// } from '@angular/forms';

// export interface SaveResponse {
//   message: string;
//   company_id?: string;
// }

// export interface CreatePaymentIntentResponse {
//   clientSecret: string;
// }

// export interface PaymentStatusResponse {
//   status: string;
// }

// export interface CompanyCheckResponse {
//   message: string;
//   company_id: string;
// }

// export interface PaymentChargesResponse {
//   fileForEin: number;
//   operatingAgreement: number;
//   expediteRequired: number;
//   stateFee: number;
//   registerAgentFee:number;
//   totalCharges: number;
// }

// export interface CompanyFormationState {
//   state: string;
// }

// export interface CompanyNameDetails {
//   companyName: string;
//   llcSuffix: string;
// }

// export interface FormationDate {
//   formationDate: string | null;
// }

// export interface BusinessDescription {
//   companyId: number;
//   businessDescription: string;
//   tradeName: string; // ← new
//   principalActivity: string; // ← new
// }

// export interface EINDetails {
//   EIN: boolean;
// }

// export interface OperatingAgreementDetails {
//   OA: boolean;
// }

// export interface ExpeditedDetails {
//   Expedit: boolean;
// }

// export interface ManagementDetails {
//   management: string;
// }

// export interface Address {
//   streetAddress1: string;
//   streetAddress2: string;
//   city: string;
//   state: string;
//   zipCode: string;
// }

// export interface MemberDetails {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   ownership: string;
//   useAddress: boolean;
//   isEinResponsibleParty?: boolean;
//   einTaxId?: string;

//   // Flattened address fields (match your Java DTO)
//   streetAddress1: string;
//   streetAddress2?: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
// }

// export interface ManagerDetails {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   streetAddress1: string;
//   streetAddress2?: string; // Optional since it might be empty
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
// }

// export interface RegisteredAgentDetails {
//   useagentAddress: boolean;
//   firstName: string;
//   lastName: string;
//   streetAddress1: string;
//   streetAddress2: string;
//   city: string;
//   state: string;
//   zipCode: string;
// }

// export interface PrimaryContactDetails {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
// }

// export interface MailingAddress {
//   useAddress: boolean;
//   streetAddress1: string;
//   streetAddress2: string;
//   city: string;
//   state: string;
//   zipCode: string;
// }

// export interface PaymentCharges {
//   stateFee: number;
//   fileForEin: number;
//   operatingAgreement: number;
//   expediteRequired: number;
  
// }
// export interface EinFormDetails{
//   companyId: number;
//   llcName: string;
//   tradeName: string;
//   mailingStreetAddress: string;
//   mailingCity: string;
//   mailingState: string;
//   mailingZipCode: string;
//   businessStreetAddress: string;
//   businessCity: string;
//   businessState: string;
//   businessZipCode: string;
//   responsiblePartyName: string;
//   ssnId: string;
//   usePhysicalAddressForMailing: boolean;
//   numberOfMembers: number;
//   formationDate: string;    // YYYY-MM-DD
//   principalActivity: string;
//   principalSubActivity:string;
//   reasonForApplyingId: number,
//   phoneNumber: string;
//   email: string;
//   closingMonth : string;
//   husbandWifeMembers: boolean;
//   fileAnnualPayrollTaxes: boolean;
//   sellsAlcoholTobaccoFirearms: boolean;
//   involvesGambling: boolean;
//   ownsHeavyVehicle: boolean;
//   paysFederalExciseTaxes: boolean;
//   hireEmployeeIn12Months: boolean;
//   firstWageDate : string;
//   householdEmployees : number;
//   agriculturalEmployees : number;
//   otherEmployees : number;
//   previousFederalTaxId : string;
//   llcType : string;
// }



// export interface AgentDetails {
//   firstName: string;
//   lastName: string;
//   streetAddress1: string;
//   streetAddress2: string;
//   city: string;
//   state: string;
//   zipCode: string;
// }
// export interface CompanyDetails {
//   step1: string;
//   step2: CompanyNameDetails;
//   step3: string;
//   step4: string;
//   step5: PrimaryContactDetails;
//   step6: RegisteredAgentDetails;
//   step7: boolean;
//   step8: boolean;
//   step9: boolean;
//   step10: boolean;
//   step11: PaymentCharges;
//   step13a?: ManagerDetails[];
//   step13b?: MemberDetails[];
//   step14?: MailingAddress;
//   step15?: boolean;
//   managementStyle?: string;
// }

// // Form factory class
// export class CompanyFormationForms {
//   constructor(private fb: FormBuilder) {}

//   createStateFormGroup(myControl: FormControl<string | null>): FormGroup {
//     return this.fb.group({
//       stateCtrl: myControl,
//     });
//   }

//   createBusinessFormGroup(): FormGroup {
//     return this.fb.group({
//       companyName: [
//         "",
//         [
//           Validators.required,
//           Validators.minLength(1),
//           Validators.maxLength(150),
//           Validators.pattern(/^[A-Za-z0-9\s\-\.',&]+$/),
//         ],
//       ],
//       llcSuffix: ['', [Validators.required]],
//     });
//   }

//   createFormationDateFormGroup(): FormGroup {
//     return this.fb.group({
//       formationDate: [null, [Validators.required]],
//     });
//   }

//   createBusinessDescriptionFormGroup(): FormGroup {
//     return this.fb.group({
//       businessDescription: [
//         "",
//         [
//           Validators.required,
//           Validators.maxLength(255), // ← enforce 255 chars maximum
//         ],
//       ],
//       tradeName: ["", [Validators.required]],
//       principalActivity: [
//         "",
//         [
//           Validators.required,
//           // Validators.pattern(
//           //   "^(?!\\s)(?!.*\\s$)[A-Za-z0-9][A-Za-z0-9\\s&.,'\\-/–—]*[A-Za-z0-9]$"
//           // ),
//         ],
//       ],
//     });
//   }

//   createEinFormGroup(): FormGroup {
//     return this.fb.group({
//       EIN: [false, [Validators.required]],
//     });
//   }

//   createOperatingAgreementFormGroup(): FormGroup {
//     return this.fb.group({
//       OA: [false, [Validators.required]],
//     });
//   }

//   createExpeditedFormGroup(): FormGroup {
//     return this.fb.group({
//       Expedit: [false, [Validators.required]],
//     });
//   }

//   createManagementFormGroup(): FormGroup {
//     return this.fb.group({
//       management: [' ', [Validators.required]],
//     });
//   }

//   createMemberForm(): FormGroup {
//     return this.fb.group({
//       members: this.fb.array([this.createMemberFormGroup()]),
//     });
//   }

//   createMemberFormGroup(): FormGroup {
//     return this.fb.group({
//       firstName: ["", [Validators.required, Validators.pattern("^[A-Za-z]+( [A-Za-z]+)*$")]],
//       lastName: ["", [Validators.required, Validators.pattern("^[A-Za-z]+( [A-Za-z]+)*$")]],
//       email: [
//         "",
//         [
//           Validators.required,
//           Validators.email,
//           Validators.pattern(
//             "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
//           ),
//         ],
//       ],
//       phoneNumber: [
//         "",
//         [
//           Validators.required,
//           Validators.pattern("^\\(\\d{3}\\) \\d{3}-\\d{4}$"),
//         ],
//       ],
//       ownership: [
//         null,
//         [Validators.required, Validators.min(1), Validators.max(100)],
//       ],
//       useAddress: [false],
//       isEinResponsibleParty: [false],
    
//       address: this.fb.group({
//         streetAddress1: ["", [Validators.required]],
//         streetAddress2: [""],
//         city: ["", [Validators.required, Validators.pattern(/^(?!\s*$)[A-Za-z ]+$/)]],
//         state: ["", [Validators.required]],
//         zipCode: ["", [Validators.required, Validators.pattern("^[0-9]{5}$")]],
//       }),
//     });
//   }

//   createManagerForm(): FormGroup {
//     return this.fb.group({
//       managers: this.fb.array([this.createManagerFormGroup()]),
//     });
//   }

//   createManagerFormGroup(): FormGroup {
//     return this.fb.group({
//       firstName: ['', [Validators.required, Validators.pattern("^[A-Za-z]+( [A-Za-z]+)*$")]],
//       lastName: ['', [Validators.required, Validators.pattern("^[A-Za-z]+( [A-Za-z]+)*$")]],
//       email: [
//         '',
//         [
//           Validators.required,
//           Validators.email,
//           Validators.pattern(
//             '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'
//           ),
//         ],
//       ],
//       phoneNumber: [
//         '',
//         [
//           Validators.required,
//           Validators.pattern('^\\(\\d{3}\\) \\d{3}-\\d{4}$'),
//         ],
//       ],
//       useAddress_1: [false],
//       managerAddress: this.fb.group({
//         streetAddress1: ['', [Validators.required]],
//         streetAddress2: [''],
//         city: ['', [Validators.required, Validators.pattern(/^(?!\s*$)[A-Za-z ]+$/)]],
//         state: ['', [Validators.required]],
//         zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
//       }),
//     });
//   }

//   createAddressForm(): FormGroup {
//     return this.fb.group({
//       useOurAddress: [false],
//       streetAddress1: ['', [Validators.required]],
//       streetAddress2: [''],
//       city: ['', [Validators.required, Validators.pattern(/^(?!\s*$)[A-Za-z ]+$/)]],
//       state: ['', [Validators.required]],
//       zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
//     });
//   }

//   createRegisteredAgentForm(): FormGroup {
//     return this.fb.group({
//       useagentAddress: [false],
//       firstName: ['', [Validators.required, Validators.pattern("^[A-Za-z]+( [A-Za-z]+)*$")]],
//       lastName: ['', [Validators.required, Validators.pattern("^[A-Za-z]+( [A-Za-z]+)*$")]],
//       streetAddress1: ['', [Validators.required]],
//       streetAddress2: [''],
//       city: ['', [Validators.required, Validators.pattern(/^(?!\s*$)[A-Za-z ]+$/)]],
//       state: ['', [Validators.required]],
//       zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
//     });
//   }

//   createPrimaryContactForm(): FormGroup {
//     return this.fb.group({
//       firstName: ['', [Validators.required, Validators.pattern("^[A-Za-z]+( [A-Za-z]+)*$")]],
//       lastName: ['', [Validators.required, Validators.pattern("^[A-Za-z]+( [A-Za-z]+)*$")]],
//       email: [
//         '',
//         [
//           Validators.required,
//           Validators.email,
//           Validators.pattern(
//             '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'
//           ),
//         ],
//       ],
//       phoneNumber: [
//         '',
//         [
//           Validators.required,
//           Validators.pattern('^\\(\\d{3}\\) \\d{3}-\\d{4}$'),
//         ],
//       ],
//     });
//   }

// // Update the createEinApplicationForm method to add conditional validators
// createEinApplicationForm(): FormGroup {
//   const form = this.fb.group(
//     {
//       responsiblePartyName: ["", Validators.required],
//       ssnItin: [
//         "",
//         [
//           Validators.required,
//           Validators.pattern("^[0-9]{3}-[0-9]{2}-[0-9]{4}$"),
//         ],
//       ],
//       verifySsnItin: [
//         "",
//         [
//           Validators.required,
//           Validators.pattern("^[0-9]{3}-[0-9]{2}-[0-9]{4}$"),
//         ],
//       ],
//       llcName: [""],
//       numberOfMembers: [""],
//       tradeName: ["", Validators.required],
//       //careOfName: [""],
//       reasonForApplying: [1, Validators.required],
//       primaryActivity: ["", Validators.required],
//       principalSubActivity:["",Validators.required],
//       businessStreetAddress: ["", Validators.required],
//       businessCity: [
//         "",
//         [Validators.required, Validators.pattern(/^(?!\s*$)[A-Za-z ]+$/)],
//       ],
//       businessState: [""],
//       businessZipCode: [
//         "",
//         [Validators.required, Validators.pattern("^[0-9]{5}$")],
//       ],
//       usePhysicalAddressForMailing: [true],
//       mailingStreetAddress: [""],
//       mailingCity: [
//         "",
//         [Validators.required, Validators.pattern(/^(?!\s*$)[A-Za-z ]+$/)],
//       ],
//       mailingState: [""],
//       mailingZipCode: ["", Validators.pattern("^[0-9]{5}$")],
//       email: [
//         "",
//         [
//           Validators.required,
//           Validators.email,
//           Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"),
//         ],
//       ],
//       phoneNumber: [
//         "",
//         [
//           Validators.required,
//           Validators.pattern("^\\(\\d{3}\\) \\d{3}-\\d{4}$"),
//         ],
//       ],
//       formationDate: [null, [Validators.required]],
//       closingMonth: ["December", [Validators.required]],

//       // Husband & Wife
//       husbandWifeMembers: [false],
//       LLCType: [""],

//       // Standard checkboxes
//       ownsHeavyVehicle: [false],
//       involvesGambling: [false],
//       sellsAlcoholTobaccoFirearms: [false],
//       paysFederalExciseTaxes: [false],
//       previousFederalTaxId: ["", [Validators.pattern(/^\d{2}-\d{7}$/)]],
//       hireEmployeeIn12Months: [false],

//       // Employee details
//       firstWageDate: [null],
//       householdEmployees: ["", Validators.min(0)],
//       agriculturalEmployees: ["", Validators.min(0)],
//       otherEmployees: ["", Validators.min(0)],
//       fileAnnualPayrollTaxes: [false],
//     },
//     { validators: this.ssnMatchValidator }
//   );

//   // Add conditional validators for mailing address fields
//   const usePhysicalControl = form.get('usePhysicalAddressForMailing');
//   usePhysicalControl?.valueChanges.subscribe(usePhysical => {
//     const mailingControls = [
//       'mailingStreetAddress',
//       'mailingCity', 
//       'mailingState',
//       'mailingZipCode'
//     ];
    
//     mailingControls.forEach(controlName => {
//       const control = form.get(controlName);
//       if (!usePhysical) {
//         // Add required validator when mailing address is shown
//         control?.setValidators([Validators.required]);
//       } else {
//         // Remove validators when mailing address is hidden
//         control?.clearValidators();
//       }
//       control?.updateValueAndValidity();
//     });
//   });

//   return form;
// }


// // SSN/ITIN MATCH VALIDATOR
// private ssnMatchValidator(group: AbstractControl): ValidationErrors | null {
//   const ssn = group.get('ssnItin')?.value;
//   const verifySsn = group.get('verifySsnItin')?.value;
//   if (ssn && verifySsn && ssn !== verifySsn) {
//     group.get('verifySsnItin')?.setErrors({ ssnMismatch: true });
//     return { ssnMismatch: true };
//   } else {
//     // Remove ssnMismatch error if they match
//     if (group.get('verifySsnItin')?.hasError('ssnMismatch')) {
//       group.get('verifySsnItin')?.setErrors(null);
//     }
//     return null;
//   }
// }

// }
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { US_PHONE_PATTERN,NAME_MAX,STATE_PATTERN,CITY_COUNTRY_PATTERN,ZIP5_PATTERN,NAME_PATTERN,ADDRESS_PATTERN,ADDRESS1_MAX,ADDRESS2_MAX,EMAIL_PATTERN,EIN_PATTERN ,COMPANY_NAME_MAX,COMPANY_NAME_PATTERN,CITY_MAX ,DESC_MAX,SSN_ITIN_PATTERN ,ADDRESS1_MIN,ADDRESS2_MIN,CITY_MIN ,TRADE_NAME } from './regexpattern';


/* ===========================
   DTOs / Interfaces
   =========================== */
export interface SaveResponse {
  message: string;
  company_id?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
}

export interface PaymentStatusResponse {
  status: string;
}

export interface CompanyCheckResponse {
  message: string;
  company_id: string;
}

export interface PaymentChargesResponse {
  fileForEin: number;
  operatingAgreement: number;
  expediteRequired: number;
  stateFee: number;
  registerAgentFee:number;
  totalCharges: number;
}

export interface CompanyFormationState {
  state: string;
}

export interface CompanyNameDetails {
  companyName: string;
  llcSuffix: string;
}

export interface FormationDate {
  formationDate: string | null;
}

export interface BusinessDescription {
  companyId: number;
  businessDescription: string;
  tradeName: string;
  principalActivity: string;
}

export interface EINDetails {
  EIN: boolean;
}

export interface OperatingAgreementDetails {
  OA: boolean;
}

export interface ExpeditedDetails {
  Expedit: boolean;
}

export interface ManagementDetails {
  management: string;
}

export interface Address {
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface MemberDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  ownership: string;
  useAddress: boolean;
  isEinResponsibleParty?: boolean;
  einTaxId?: string;

  // Flattened address in API; UI uses nested address form
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ManagerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface RegisteredAgentDetails {
  useagentAddress: boolean;
  firstName: string;
  lastName: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PrimaryContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface MailingAddress {
  useAddress: boolean;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PaymentCharges {
  stateFee: number;
  fileForEin: number;
  operatingAgreement: number;
  expediteRequired: number;
}

export interface EinFormDetails{
  companyId: number;
  llcName: string;
  tradeName: string;
  mailingStreetAddress: string;
  mailingCity: string;
  mailingState: string;
  mailingZipCode: string;
  businessStreetAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  responsiblePartyName: string;
  ssnId: string;
  usePhysicalAddressForMailing: boolean;
  numberOfMembers: number;
  formationDate: string;    // YYYY-MM-DD
  principalActivity: string;
  principalSubActivity:string;
  reasonForApplyingId: number,
  phoneNumber: string;
  email: string;
  closingMonth : string;
  husbandWifeMembers: boolean;
  fileAnnualPayrollTaxes: boolean;
  sellsAlcoholTobaccoFirearms: boolean;
  involvesGambling: boolean;
  ownsHeavyVehicle: boolean;
  paysFederalExciseTaxes: boolean;
  hireEmployeeIn12Months: boolean;
  firstWageDate : string;
  householdEmployees : number;
  agriculturalEmployees : number;
  otherEmployees : number;
  previousFederalTaxId : string;
  llcType : string;
}

export interface AgentDetails {
  firstName: string;
  lastName: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CompanyDetails {
  step1: string;
  step2: CompanyNameDetails;
  step3: string;
  step4: string;
  step5: PrimaryContactDetails;
  step6: RegisteredAgentDetails;
  step7: boolean;
  step8: boolean;
  step9: boolean;
  step10: boolean;
  step11: PaymentCharges;
  step13a?: ManagerDetails[];
  step13b?: MemberDetails[];
  step14?: MailingAddress;
  step15?: boolean;
  managementStyle?: string;
}


/* ===========================
   Form factory
   =========================== */
export class CompanyFormationForms {
  constructor(private fb: FormBuilder) {}

  createStateFormGroup(myControl: FormControl<string | null>): FormGroup {
    return this.fb.group({
      stateCtrl: myControl,
    });
  }

  createBusinessFormGroup(): FormGroup {
    return this.fb.group({
      companyName: [
        "",
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(COMPANY_NAME_MAX),
          Validators.pattern(COMPANY_NAME_PATTERN),
        ],
      ],
      llcSuffix: ['', [Validators.required]],
    });
  }

  createFormationDateFormGroup(): FormGroup {
    return this.fb.group({
      formationDate: [null, [Validators.required]],
    });
  }

  createBusinessDescriptionFormGroup(): FormGroup {
    return this.fb.group({
      businessDescription: [
        "",
        [Validators.required, Validators.maxLength(DESC_MAX)],
      ],
      tradeName: ["", [Validators.required, Validators.maxLength(COMPANY_NAME_MAX),Validators.pattern(TRADE_NAME)]],
      principalActivity: ["", [Validators.required]],
    });
  }

  createEinFormGroup(): FormGroup {
    return this.fb.group({
      EIN: [false, [Validators.required]],
    });
  }

  createOperatingAgreementFormGroup(): FormGroup {
    return this.fb.group({
      OA: [false, [Validators.required]],
    });
  }

  createExpeditedFormGroup(): FormGroup {
    return this.fb.group({
      Expedit: [false, [Validators.required]],
    });
  }

  createManagementFormGroup(): FormGroup {
    return this.fb.group({
      management: ['', [Validators.required]], // removed stray space default
    });
  }

  /* ===== Members ===== */
  createMemberForm(): FormGroup {
    return this.fb.group({
      members: this.fb.array([this.createMemberFormGroup()]),
    });
  }

  createMemberFormGroup(): FormGroup {
    return this.fb.group({
      firstName: ["", [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]],
      lastName:  ["", [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]],
      email: [
        "",
        [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN)],
      ],
      phoneNumber: ["", [Validators.required, Validators.pattern(US_PHONE_PATTERN)]],
      ownership: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
      useAddress: [false],
      isEinResponsibleParty: [false],

      address: this.fb.group({
        streetAddress1: ["", [Validators.required, Validators.pattern(ADDRESS_PATTERN), Validators.maxLength(ADDRESS1_MAX),Validators.minLength(ADDRESS1_MIN)]],
        streetAddress2: ["", [Validators.pattern(ADDRESS_PATTERN), Validators.maxLength(ADDRESS2_MAX),Validators.minLength(ADDRESS2_MIN)]],
        city:  ["", [Validators.required, Validators.maxLength(CITY_MAX), Validators.pattern(CITY_COUNTRY_PATTERN),Validators.minLength(CITY_MIN)]],
        state: ["", Validators.required],
        zipCode: ["", [Validators.required, Validators.pattern(ZIP5_PATTERN)]],
      }),
    });
  }

  /* ===== Managers ===== */
  createManagerForm(): FormGroup {
    return this.fb.group({
      managers: this.fb.array([this.createManagerFormGroup()]),
    });
  }

  createManagerFormGroup(): FormGroup {
    return this.fb.group({
      firstName: ["", [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]],
      lastName:  ["", [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]],
      email: [
        "",
        [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN)],
      ],
      phoneNumber: ["", [Validators.required, Validators.pattern(US_PHONE_PATTERN)]],
      useAddress_1: [false],
      managerAddress: this.fb.group({
        streetAddress1: ["",[Validators.required, Validators.pattern(ADDRESS_PATTERN), Validators.maxLength(ADDRESS1_MAX),Validators.minLength(ADDRESS1_MIN)]],
        streetAddress2: ["", [Validators.pattern(ADDRESS_PATTERN), Validators.maxLength(ADDRESS2_MAX),Validators.minLength(ADDRESS2_MIN)]],
        city:  ["", [Validators.required, Validators.maxLength(CITY_MAX), Validators.pattern(CITY_COUNTRY_PATTERN),Validators.minLength(CITY_MIN)]],
        state: ["", Validators.required],
        zipCode: ["", [Validators.required, Validators.pattern(ZIP5_PATTERN)]],
      }),
    });
  }

  /* ===== Business/Registered Agent/Primary Contact Addresses ===== */
  createAddressForm(): FormGroup {
    return this.fb.group({
      useOurAddress: [false],
      streetAddress1: ["", [Validators.required, Validators.pattern(ADDRESS_PATTERN), Validators.maxLength(ADDRESS1_MAX),Validators.minLength(ADDRESS1_MIN)]],
      streetAddress2: ["",[Validators.pattern(ADDRESS_PATTERN), Validators.maxLength(ADDRESS2_MAX),Validators.minLength(ADDRESS2_MIN)]],
      city:  ["", [Validators.required, Validators.maxLength(CITY_MAX), Validators.pattern(CITY_COUNTRY_PATTERN),Validators.minLength(CITY_MIN)]],
      state: ["", [Validators.required,]],
      zipCode: ["", [Validators.required, Validators.pattern(ZIP5_PATTERN)]],
    });
  }

  createRegisteredAgentForm(): FormGroup {
    return this.fb.group({
      useagentAddress: [false],
      firstName: ["", [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]],
      lastName:  ["", [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]],
      streetAddress1: ["", [Validators.required, Validators.pattern(ADDRESS_PATTERN), Validators.maxLength(ADDRESS1_MAX),Validators.minLength(ADDRESS1_MIN)]],
      streetAddress2: ["",[Validators.pattern(ADDRESS_PATTERN), Validators.maxLength(ADDRESS2_MAX),Validators.minLength(ADDRESS2_MIN)]],
      city:  ["", [Validators.required, Validators.maxLength(CITY_MAX), Validators.pattern(CITY_COUNTRY_PATTERN),Validators.minLength(CITY_MIN)]],
      state: ["", Validators.required],
      zipCode: ["", [Validators.required, Validators.pattern(ZIP5_PATTERN)]],
    });
  }

  createPrimaryContactForm(): FormGroup {
    return this.fb.group({
      firstName: ["", [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]],
      lastName:  ["", [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]],
      email: [
        "",
        [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN)],
      ],
      phoneNumber: ["", [Validators.required, Validators.pattern(US_PHONE_PATTERN)]],
    });
  }

  /* ===== EIN Application (conditional validators preserved) ===== */
  createEinApplicationForm(): FormGroup {
    const form = this.fb.group(
      {
        responsiblePartyName: ["", [Validators.required, Validators.maxLength(NAME_MAX)]],
        ssnItin:       ["", [Validators.required, Validators.pattern(SSN_ITIN_PATTERN)]],
        verifySsnItin: ["", [Validators.required, Validators.pattern(SSN_ITIN_PATTERN)]],

        llcName: [""],
        numberOfMembers: [""],
        tradeName: ["", [Validators.required, Validators.maxLength(COMPANY_NAME_MAX)]],
        reasonForApplying: [1, Validators.required],
        primaryActivity: ["", Validators.required],
        principalSubActivity: ["", Validators.required],

        businessStreetAddress: ["", Validators.required],
        businessCity:  ["", [Validators.required, Validators.maxLength(CITY_MAX), Validators.pattern(CITY_COUNTRY_PATTERN),Validators.minLength(CITY_MIN)]],
        businessState: [""],
        businessZipCode: ["", [Validators.required, Validators.pattern(ZIP5_PATTERN)]],

        usePhysicalAddressForMailing: [true],
        mailingStreetAddress: ["", [Validators.required, Validators.pattern(ADDRESS_PATTERN), Validators.maxLength(ADDRESS1_MAX),Validators.minLength(ADDRESS1_MIN)]],
        mailingCity:  ["", [Validators.required, Validators.maxLength(CITY_MAX), Validators.pattern(CITY_COUNTRY_PATTERN),Validators.minLength(CITY_MIN)]],
        mailingState: [""],
        mailingZipCode: ["", Validators.pattern(ZIP5_PATTERN)],

        email: ["", [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN)]],
        phoneNumber: ["", [Validators.required, Validators.pattern(US_PHONE_PATTERN)]],

        formationDate: [null, [Validators.required]],
        closingMonth: ["December", [Validators.required]],

        husbandWifeMembers: [false],
        LLCType: [""],

        ownsHeavyVehicle: [false],
        involvesGambling: [false],
        sellsAlcoholTobaccoFirearms: [false],
        paysFederalExciseTaxes: [false],
        previousFederalTaxId: ["", [Validators.pattern(EIN_PATTERN)]],
        hireEmployeeIn12Months: [false],

        firstWageDate: [null],
        householdEmployees: ["", Validators.min(0)],
        agriculturalEmployees: ["", Validators.min(0)],
        otherEmployees: ["", Validators.min(0)],
        fileAnnualPayrollTaxes: [false],
      },
      { validators: this.ssnMatchValidator }
    );

    // Conditional validators for mailing address fields
    const usePhysicalControl = form.get('usePhysicalAddressForMailing');
    usePhysicalControl?.valueChanges.subscribe(usePhysical => {
      const mailingControls = ['mailingStreetAddress','mailingCity','mailingState','mailingZipCode'];
      mailingControls.forEach(name => {
        const c = form.get(name);
        if (!c) return;
        if (!usePhysical) c.setValidators([Validators.required, ...(name.includes('Zip') ? [Validators.pattern(ZIP5_PATTERN)] : [])]);
        else c.clearValidators();
        c.updateValueAndValidity({ emitEvent: false });
      });
    });

    return form;
  }

  /* ===== SSN/ITIN Match Validator ===== */
  private ssnMatchValidator(group: AbstractControl): ValidationErrors | null {
    const ssn = group.get('ssnItin')?.value;
    const verifySsn = group.get('verifySsnItin')?.value;
    if (ssn && verifySsn && ssn !== verifySsn) {
      group.get('verifySsnItin')?.setErrors({ ssnMismatch: true });
      return { ssnMismatch: true };
    } else {
      if (group.get('verifySsnItin')?.hasError('ssnMismatch')) {
        group.get('verifySsnItin')?.setErrors(null);
      }
      return null;
    }
  }
}



