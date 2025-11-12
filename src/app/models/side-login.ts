import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMAIL_PATTERN,OTP_LENGTH } from './regexpattern';

export interface Step {
  name: string;
  completed: boolean;
}

export interface UserProgress {
  steps: Step[];
}

export interface OtpResponse {
  message: string;
}

export interface ValidateOtpResponse {
  message: string;
  loginUserId: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyCount: number;
  accessToken: string;
  idToken: string;
  profileImageUrl: string;
}

/** Reusable validators/patterns */
// export const EMAIL_PATTERN =
//   /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// export const OTP_LENGTH = 6;

/** Small factory to build the Side Login form */
export function createSideLoginForm(
  fb: FormBuilder,
  initial?: { email?: string; rememberMe?: boolean }
): FormGroup {
  return fb.group({
    email: [
      initial?.email ?? '',
      [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN)],
    ],
    otp: [
      '',
      [
        Validators.required,
        Validators.minLength(OTP_LENGTH),
        Validators.maxLength(OTP_LENGTH),
      ],
    ],
    rememberMe: [initial?.rememberMe ?? false],
  });
}
