import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { US_PHONE_PATTERN,NAME_MAX,NAME_PATTERN } from './regexpattern';

export interface UserModel {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatarId?: number;
  profileImageUrl?: string; // base64 or URL
}

// Reuseable patterns

// Factory to build the form with validators
export function createAccountSettingsForm(
  fb: FormBuilder,
  data: Partial<UserModel> = {}
): FormGroup {
  return fb.group({
    firstName: [
      data.firstName ?? '',
      [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]
    ],
    lastName: [
      data.lastName ?? '',
      [Validators.required, Validators.maxLength(NAME_MAX), Validators.pattern(NAME_PATTERN)]
    ],
    email: [data.email ?? ''],
    phoneNumber: [data.phoneNumber ?? '', [Validators.pattern(US_PHONE_PATTERN)]],
    // keep separate control the same way you had it
    profileImage: [data.profileImageUrl ?? ''],
  });
}
