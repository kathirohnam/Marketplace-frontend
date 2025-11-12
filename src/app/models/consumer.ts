import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NAME_MAX,NAME_PATTERN,EMAIL_PATTERN,US_PHONE_PATTERN } from './regexpattern';

/** UI-facing consumer model */
export interface ConsumerElement {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  userCompanyId: { id: number };
}

/** Raw API response shape */
export interface ApiConsumer {
  loginUserId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleId: { id: number };
  userCompanyId: { id: number };
  isActive: boolean;
  deleted: boolean;
}

/** Reusable patterns + limits */
// export const NAME_MAX = 60;
// export const NAME_PATTERN = /^[A-Za-z]+( [A-Za-z]+)*$/;                       // words (A–Z) with single spaces
// export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
// export const US_PHONE_PATTERN = /^\(\d{3}\) \d{3}-\d{4}$/;                    // (123) 456-7890

/** Factory to build the Consumer form (no role-based switches) */
export function createConsumerForm(
  fb: FormBuilder,
  initial?: Partial<ConsumerElement>
): FormGroup {
  return fb.group({
    role: [initial?.role ?? 'Consumer', Validators.required],
    firstName: [
      initial?.firstName ?? '',
      [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)],
    ],
    lastName: [
      initial?.lastName ?? '',
      [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)],
    ],
    phone: [
      initial?.phoneNumber ?? '',
      [Validators.required, Validators.pattern(US_PHONE_PATTERN)],
    ],
    email: [
      initial?.email ?? '',
      [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN)],
    ],
    profileImage: [null],
  });
}
