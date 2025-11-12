import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { US_PHONE_PATTERN,NAME_MAX,STATE_PATTERN,CITY_COUNTRY_PATTERN,ZIP5_PATTERN,NAME_PATTERN,ADDRESS_PATTERN,ADDRESS1_MAX,ADDRESS2_MAX,EMAIL_PATTERN,EIN_PATTERN } from './regexpattern';

export interface VendorResponse {
  loginUserDto: LoginUserDto;
  userCompanyDto: UserCompanyDto | null;
}

export interface LoginUserDto {
  loginUserId: number;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  roleId: { id: number; name?: string };
  userCompanyId?: UserCompanyDto;
  createdOn?: string;
  createdBy?: string;
  isActive?: boolean;
  deleted?: boolean;
}

export interface UserCompanyDto {
  id?: number;
  name: string;
  ein: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDeleted: boolean;
  addBy: string | null;
  addDate: string | null;
  lastModBy: string | null;
  lastModDate: string;
}

export interface AdminElement {
  id?: number;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ein?: string;
  vendorName?: string;
  alternativeName?: string;
  vendorContactNumber?: string;
  vendor_email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  userCompanyId?: number;
  createdOn?: string;
  createdBy?: string;
  isActive?: boolean;
}

/* Patterns + limits (shared) */
// export const NAME_MAX = 60;
// export const ADDRESS1_MAX= 120;
// export const ADDRESS2_MAX = 80;
// export const NAME_PATTERN = /^[A-Za-z]+( [A-Za-z]+)*$/;
// export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
// export const US_PHONE_PATTERN = /^\(\d{3}\) \d{3}-\d{4}$/;   // (123) 456-7890
// export const EIN_PATTERN = /^[0-9]{2}-[0-9]{7}$/;            // 12-3456789
// export const ADDRESS_PATTERN = /^[\p{L}\p{N}\s.'#\-/,]+$/u;
// export const STATE_PATTERN = /^[A-Za-z]{2}$/;                // CA, TX, ...
// export const CITY_COUNTRY_PATTERN = /^[\p{L}\s.'\-]+$/u;
// export const ZIP5_PATTERN = /^\d{5}$/;

/** Static (no role-based changes) Admin form factory */
export function createAdminForm(fb: FormBuilder): FormGroup {
  return fb.group({
    role: ['', Validators.required],

    // Required always
    firstName: ['', [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]],
    lastName:  ['', [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]],
    phone:     ['', [Validators.required, Validators.pattern(US_PHONE_PATTERN)]],
    email:     ['', [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN)]],

    // Optional fields: validated ONLY when provided (no `required`)
    ein:                 ['', [Validators.pattern(EIN_PATTERN)]],
    vendorName:          ['', [Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]],
    alternativeName:     [''],
    vendorContactNumber: ['', [Validators.pattern(US_PHONE_PATTERN)]],
    vendor_email:        ['', [Validators.email, Validators.pattern(EMAIL_PATTERN)]],
    address:             ['', [Validators.pattern(ADDRESS_PATTERN),Validators.maxLength(ADDRESS1_MAX)]],
    city:                ['', [Validators.pattern(CITY_COUNTRY_PATTERN)]],
    state:               ['', [Validators.pattern(STATE_PATTERN), Validators.maxLength(2)]],
    country:             ['', [Validators.pattern(CITY_COUNTRY_PATTERN)]],
    zip:                 ['', [Validators.pattern(ZIP5_PATTERN)]],

    profileImage: [null],
  });
}
