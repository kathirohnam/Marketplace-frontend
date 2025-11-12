import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { US_PHONE_PATTERN,NAME_MAX,STATE_PATTERN,CITY_COUNTRY_PATTERN,ZIP5_PATTERN,NAME_PATTERN,ADDRESS_PATTERN,ADDRESS1_MAX,ADDRESS2_MAX,EMAIL_PATTERN, TRANSACTIONCODE_PATTERN,AMOUNT_PATTERN} from './regexpattern';
export interface Filler {
  id: number;
  company: string;
  state: string;
  status: string;
  date: Date | string;
  hasDocuments?: boolean;
  isEinSelected: boolean; 
}

export interface DocumentType {
  documentTypeId: number; // Matches the API response field
  typeName: string; // Matches the API response field
  description?: string; // Optional description
}

export interface UploadedFile {
  file: File;
  preview?: string;
  progress?: number;
  error?: string;
}
export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size?: number;
}
export interface EinCompany {
  companyId: number;
  companyName: string;
  
  state: string;
  date: string | null;
  isExpeditedServiceSelected: boolean | null;
  viewStatus: boolean; // computed from date != null
}
export interface PersonLike {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ownership?: number;
}
  // Patterns (exactly as requested)
// export const NAME_MAX = 60;
// export const CITY_MAX = 60;
// export const ADDRESS1_MAX = 120;
// export const ADDRESS2_MAX = 80;
// export const NAME_PATTERN = /^[A-Za-z]+( [A-Za-z]+)*$/;
// export const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
// export const US_PHONE_PATTERN = /^\(\d{3}\) \d{3}-\d{4}$/; 
// export const CITY_COUNTRY_PATTERN = /^[\p{L}\s.'\-]+$/u;  
// export const ZIP5_PATTERN= /^[0-9]{5}$/;
// export const ADDRESS_PATTERN= /^[\p{L}\p{N}\s.'#\-/,]+$/u;
// export const TRANSACTIONCODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{6,28}[A-Za-z0-9]$/;
// export const AMOUNT_PATTERN = /^(?:(?:0|[1-9]\d*)(?:\.\d{1,2})?|(?:[1-9]\d{0,2}(?:,\d{3})+)(?:\.\d{1,2})?)$/;

export function createFilingForm(fb: FormBuilder): FormGroup {
  return fb.group({
      filingDate: [null, Validators.required],
      paymentAmount: [null,[
          Validators.required,
          Validators.pattern(AMOUNT_PATTERN),
        ],],
      transactionCode: [
        "",
        [
          Validators.required,
          Validators.pattern(TRANSACTIONCODE_PATTERN),
        ],
      ],
      paymentMethod: [null, Validators.required],
      payerName: [
        "",
        [
          Validators.required,
          Validators.pattern(NAME_PATTERN),
          Validators.maxLength(NAME_MAX),
        ],
      ],
    });
  }
export function createFailureForm(fb: FormBuilder): FormGroup {
  return fb.group({
      failureCategory: ["", Validators.required],
      failureDescription: ["", Validators.required],
      nextSteps: ["", Validators.required],
    });
}

export function createPrimaryContactForm(fb: FormBuilder): FormGroup {
  return fb.group({
      firstName: ["", [Validators.required, Validators.pattern(NAME_PATTERN), Validators.maxLength(NAME_MAX)]],
      lastName: ["", [Validators.required, Validators.pattern(NAME_PATTERN), Validators.maxLength(NAME_MAX)]],
      email: [
        "",
        [
          Validators.required,
          Validators.email,
          Validators.pattern(EMAIL_PATTERN),
        ],
      ],
      phoneNumber: [
        "",
        [Validators.required, Validators.pattern(US_PHONE_PATTERN)],
      ],
    });
}
export function createBusinessAddressForm(fb: FormBuilder): FormGroup {
  return fb.group({
      streetAddress1: ["", [Validators.required, Validators.pattern(ADDRESS_PATTERN),Validators.maxLength(ADDRESS1_MAX)]],
      streetAddress2: ["",[Validators.pattern(ADDRESS_PATTERN),Validators.maxLength(ADDRESS2_MAX)]],
      city: ["", [Validators.required, Validators.pattern(CITY_COUNTRY_PATTERN)]],
      state: ["", [Validators.required]],
      zipCode: ["", [Validators.required, Validators.pattern(ZIP5_PATTERN)]],
    });
}
export function createRegisteredAgentForm(fb: FormBuilder): FormGroup {
  return fb.group({
      firstName: ["", [Validators.required, Validators.pattern(NAME_PATTERN), Validators.maxLength(NAME_MAX)]],
      lastName: ["", [Validators.required, Validators.pattern(NAME_PATTERN), Validators.maxLength(NAME_MAX)]],
      streetAddress1: ["", [Validators.required, Validators.pattern(ADDRESS_PATTERN),Validators.maxLength(ADDRESS1_MAX)]],
      streetAddress2: ["",[Validators.pattern(ADDRESS_PATTERN),Validators.maxLength(ADDRESS2_MAX)]],
      city: ["", [Validators.required, Validators.pattern(CITY_COUNTRY_PATTERN)]],
      state: ["", [Validators.required]],
      zipCode: ["", [Validators.required, Validators.pattern(ZIP5_PATTERN)]],
      email: ["", [
          Validators.required,
          Validators.email,
          Validators.pattern(EMAIL_PATTERN),
        ],], // not in your UI, left optional (no effect)
      phoneNumber: ["",[Validators.required, Validators.pattern(US_PHONE_PATTERN)],], // not in your UI, left optional (no effect)
    });
}
export function createManagerForm(fb: FormBuilder): FormArray {
      return fb.array([]);
}
export function createMembersForm(fb: FormBuilder): FormArray {
      return fb.array([]);
}
export function createPersonGroup(fb: FormBuilder, from: PersonLike = {}, isMember = false): FormGroup {
  const group: any = {
    firstName: [
      from.firstName ?? '',
      [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)],
    ],
    lastName: [
      from.lastName ?? '',
      [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)],
    ],
    email: [
      from.email ?? '',
      [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN)],
    ],
    phoneNumber: [
      from.phoneNumber ?? '',
      [Validators.required, Validators.pattern(US_PHONE_PATTERN)],
    ],
    streetAddress1: [from.streetAddress1 ?? '', [Validators.required, Validators.pattern(ADDRESS_PATTERN), Validators.maxLength(ADDRESS1_MAX)],],
    streetAddress2: [from.streetAddress2 ?? '', [Validators.pattern(ADDRESS_PATTERN), Validators.maxLength(ADDRESS2_MAX)],],
    city: [
      from.city ?? '',
      [Validators.required, Validators.pattern(CITY_COUNTRY_PATTERN)],
    ],
    state: [
      from.state ?? '',
      [Validators.required],
    ],
    zipCode: [
      from.zipCode ?? '',
      [Validators.required, Validators.pattern(ZIP5_PATTERN)],
    ]
  };

  // Only add ownership for members
  if (isMember) {
    group.ownership = [
      from.ownership ?? null,
      [Validators.required, Validators.min(1), Validators.max(100)]
    ];
  }

  return fb.group(group);
}