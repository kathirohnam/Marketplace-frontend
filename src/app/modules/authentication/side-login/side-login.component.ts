import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroupDirective,
  NgForm,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { createSideLoginForm } from "src/app/models/side-login";

import { HttpClientModule } from "@angular/common/http";
import { finalize } from "rxjs/operators";
import { ServiceLogin } from "src/app/services/login/service-login";
import { UserProgress } from "src/app/models/side-login";
import { MaterialModule } from "src/app/material.module";
import { CoreService } from "src/app/services/core.service";
import { SnackBarService } from "src/app/shared/snackbar.service";
import { AccountSettingService } from "src/app/services/apps/account-settings/account-settings.service";
import { UserModel } from "src/app/models/account-settings";
import { AppComponent } from "src/app/app.component";
import { TokenService } from "src/app/services/token/token.service";
import { NgxMaskDirective, NgxMaskPipe } from "ngx-mask";
import { ErrorStateMatcher } from "@angular/material/core";
import { UserService } from "src/app/shared/userService";
import { LoadingService } from "src/app/services/loading/loading.service";

export class TouchedOnlyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}
@Component({
  selector: "app-side-login",
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    MaterialModule,
    NgxMaskDirective,
    // NgxMaskPipe,
  ],
  templateUrl: "./side-login.component.html",
  styleUrls: ["./side-login.component.scss"],
  providers: [
    { provide: ErrorStateMatcher, useClass: TouchedOnlyErrorStateMatcher },
  ],
})
export class AppSideLoginComponent implements OnInit, OnDestroy {
  form: FormGroup;
  otpSent = false;
  otpInvalid = false;
  message = "";
  loading = false;
  error = false;
  otpexpired = false;
  options: any;
  reload = false;
  showotp = false;
  errorStateMatcher = new TouchedOnlyErrorStateMatcher();
  // Add with your other fields
  private readonly OTP_EXPIRY_KEY = "otpExpiryTs";
  private visibilityHandler = () => this.updateTimeRemainingFromClock();

  // Timer properties
  timeRemaining = 300; // 5 minutes in seconds
  timerActive = false;
  private timerInterval: any;

  // Validation state tracking
  private validationMessages = {
    email: {
      required: "Email address is required",
      email: "Please enter a valid email address",
      pattern: "Please enter a valid email address",
    },
    otp: {
      required: "Verification code is required",
      minlength: "Please enter a valid 6-digit verification code",
    },
  };

  appComponent = inject(AppComponent);

  private readonly EMAIL_KEY = "rememberedEmail";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBarService: SnackBarService,
    private loginService: ServiceLogin,
    private settings: CoreService,
    private accountSettingService: AccountSettingService,
    private tokenService: TokenService,
    private userService: UserService,
    private loadingService: LoadingService
  ) {
    this.form = createSideLoginForm(this.fb);

    // Add real-time validation
    this.setupRealTimeValidation();
  }

  ngOnInit() {
    sessionStorage.removeItem(this.OTP_EXPIRY_KEY);
    this.options = this.settings.getOptions();
    const saved = localStorage.getItem(this.EMAIL_KEY);
    if (saved) {
      this.form.patchValue({ email: saved, rememberMe: true });
    }

    // ⏱️ Resume timer if an expiry was previously set
    const savedExpiryStr = sessionStorage.getItem(this.OTP_EXPIRY_KEY);
    if (savedExpiryStr) {
      const expiry = parseInt(savedExpiryStr, 10);
      const now = Date.now();
      if (expiry > now) {
        this.otpSent = true;
        this.showotp = true;
        this.otpexpired = false;
        this.startTimer(expiry); // resume using existing expiry
      } else {
        // already expired
        this.onTimerExpired();
      }
    }

    //
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  private setupRealTimeValidation() {
    // Email validation
    this.f["email"].valueChanges.subscribe(() => {
      if (this.f["email"].touched) {
        this.validateEmailField();
      }
    });

    // OTP validation
    this.f["otp"].valueChanges.subscribe(() => {
      if (this.f["otp"].value && this.f["otp"].value.length > 0) {
        this.validateOtpField();
      }
    });
  }

  private validateEmailField() {
    const emailControl = this.f["email"];
    if (emailControl.invalid && emailControl.touched) {
      // Email validation handled by template
      return false;
    }
    return true;
  }

  private validateOtpField() {
    const otpControl = this.f["otp"];
    if (otpControl.value && otpControl.value.length === 6) {
      this.otpInvalid = false;
      return true;
    } else if (
      otpControl.value &&
      otpControl.value.length > 0 &&
      otpControl.value.length < 6
    ) {
      this.otpInvalid = true;
      return false;
    }
    return false;
  }

  get f() {
    return this.form.controls as { [key: string]: any };
  }

  private get normalizedEmail(): string {
    return this.f["email"].value.trim().toLowerCase();
  }

  // Timer methods
  // Timer now driven by a fixed expiry timestamp
  private startTimer(existingExpiryTs?: number) {
    // 1) Clear any existing interval FIRST
    this.clearTimer();

    // 2) Compute/persist expiry
    const expiry = existingExpiryTs ?? Date.now() + 300 * 1000; // 5 minutes
    sessionStorage.setItem(this.OTP_EXPIRY_KEY, String(expiry));

    // 3) Prime the display
    this.updateTimeRemainingFromClock();

    // 4) Now mark active and start ticking
    this.timerActive = true;
    this.timerInterval = setInterval(() => {
      this.updateTimeRemainingFromClock();
    }, 1000);
  }

  private updateTimeRemainingFromClock() {
    const expiryStr = sessionStorage.getItem(this.OTP_EXPIRY_KEY);
    if (!expiryStr) return;

    const expiry = parseInt(expiryStr, 10);
    const now = Date.now();
    const diffMs = Math.max(0, expiry - now);
    this.timeRemaining = Math.floor(diffMs / 1000);

    if (diffMs <= 0) {
      this.onTimerExpired();
    }
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerActive = false;
  }

  private onTimerExpired() {
    this.clearTimer();
    sessionStorage.removeItem(this.OTP_EXPIRY_KEY);
    this.otpexpired = true;
    this.error = true;
    this.message = "OTP expired. Please request a new one.";
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  sendOtp() {
    if (this.f["email"].invalid || this.loading) return;

    // Mark email as touched for validation display
    this.f["email"].markAsTouched();

    if (!this.validateEmailField()) {
      this.error = true;
      this.message = "Please enter a valid email address";
      return;
    }

    this.reload = true;
    this.loading = true;
    this.message = "";
    const email = this.normalizedEmail;
    this.otpSent = true;

    this.loginService
      .sendOtp(email)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          localStorage.clear();
          sessionStorage.clear();
          this.message = res.message || "OTP sent successfully.";
          this.reload = false;
          this.error = false;
          this.showotp = true;
          if (
            res.message?.includes("User is deleted. Please contact support.")
          ) {
            this.showotp = false;
          } else {
            this.showotp = true;
          }
          this.otpexpired = false;
          this.otpInvalid = false;
          this.f["otp"].setValue("");
          localStorage.setItem("email", this.f["email"].value.toLowerCase());
          this.handleRememberMe();

          // Start the countdown timer
          this.startTimer();
        },
        error: (err) => {
          this.error = true;
          this.message =
            err.status === 400
              ? err.error?.message || "❌ Invalid email."
              : "❌ Something went wrong.";
          this.otpSent = false;
          this.showotp = false;
        },
      });
  }

  validateOtp() {
    if (!this.f["otp"].value || this.f["otp"].value.length < 6) {
      this.otpInvalid = true;
      this.error = true;
      this.message = "Please enter a valid 6-digit verification code";
      return;
    }

    this.otpInvalid = false;
    this.loading = true;
    this.message = "";
    const email = this.normalizedEmail;
    const token = this.f["otp"].value;

    this.loginService
      .validateOtp(email, token)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.error = true;
          this.message = res.message;

          if (res.message.includes("OTP expired")) {
            this.otpexpired = true;
            this.otpInvalid = true;
            this.clearTimer();
          } else if (res.message.includes("successfully")) {
            this.error = false;
            this.clearTimer(); // Clear timer on successful login
            sessionStorage.removeItem(this.OTP_EXPIRY_KEY);

            // setting values for account settings
            const userData: UserModel = {
          
              firstName: res.firstName,
              lastName: res.lastName,
              email: res.email || localStorage.getItem("email") || "",
              phoneNumber: res.phoneNumber,
              profileImageUrl: res.profileImageUrl,
            };

            sessionStorage.setItem("userData", JSON.stringify(userData));
            this.userService.updateUser(userData);
            this.tokenService.saveToken(res.accessToken); //  Save encrypted  access token
            this.tokenService.saveToken(res.idToken, "id"); // Save encrypted ID token
            console.log("Access Token:", res.accessToken);
            console.log("ID Token:", res.idToken);
            sessionStorage.setItem("login_user_id", res.loginUserId);
            // sessionStorage.setItem('user_role', res.role);

            localStorage.setItem("login_user_id", res.loginUserId);

            // this.loginService.logAudit(email).subscribe();
            this.snackBarService.show("Logged in successfully!", "Close", {
              duration: 3000,
            });
            const user_role = this.tokenService.getRole() ?? "";

            this.navigateBasedOnRole(user_role, res.companyCount);

            this.otpInvalid = false;
          }
        },
        error: (err) => {
          this.error = true;
          this.otpInvalid = true;
          this.message = err.error?.message || "❌ Incorrect OTP.";
        },
      });
  }

  onButtonClick() {
    if (this.otpSent && this.otpexpired) {
      this.sendOtp();
    } else if (this.otpSent && !this.otpexpired) {
      this.validateOtp();
    } else {
      this.sendOtp();
    }
  }

  canProceed(): boolean {
    if (this.otpSent && !this.otpexpired) {
      return (
        this.f["otp"] && this.f["otp"].value?.length === 6 && !this.otpInvalid
      );
    } else {
      return this.f["email"] && this.f["email"].valid;
    }
  }

  get buttonText(): string {
    if (this.otpSent && this.otpexpired) return "Resend OTP";
    if (this.otpSent) return "Login";
    return "Send OTP";
  }

  resetEmail(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.f["email"].setValue("");
    this.f["otp"].setValue("");
    this.f["email"].markAsUntouched();
    this.f["otp"].markAsUntouched();
    this.form.patchValue({ rememberMe: false });
    localStorage.removeItem(this.EMAIL_KEY);
    this.otpSent = false;
    this.showotp = false;
    this.otpInvalid = false;
    this.loading = false;
    this.message = "";
    this.error = false;
    this.otpexpired = false;

    // Clear timer when resetting
    this.clearTimer();
    sessionStorage.removeItem(this.OTP_EXPIRY_KEY);
  }

  handleRememberMe() {
    this.f["rememberMe"].value
      ? localStorage.setItem(this.EMAIL_KEY, this.f["email"].value)
      : localStorage.removeItem(this.EMAIL_KEY);
  }

  navigateBasedOnRole(role: string, companyCount: number) {
    switch (role) {
      case "Consumer":
        const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
        sessionStorage.setItem("companyCount", String(companyCount));
        console.log(String(companyCount), userData.firstName);
        if (
          companyCount >= 0 &&
          userData.firstName !== null &&
          userData.firstName !== undefined &&
          userData.lastName !== null &&
          userData.lastName !== undefined
        ) {
          this.router.navigate(["/apps/dashboard"]);
        } else {
          this.router.navigate(["/apps/account-settings"]);
        }

        break;
      case "Admin":
        this.router.navigate(["/apps/admin"]);
        break;
      case "SuperFiler":
        this.router.navigate(["/apps/Files"]);
        break;
      case "Vendor":
        this.router.navigate(["/apps/consumer"]);
        break;
      default:
        this.router.navigate(["/authentication/login"]);
    }
  }

  getButtonIcon(): string {
    if (this.otpSent && this.otpexpired) return "refresh";
    if (this.otpSent) return "login";
    return "send";
  }

  // Helper method to get validation message
  getValidationMessage(field: "email" | "otp", errorType: string): string {
    const fieldMessages = this.validationMessages[field];
    if (fieldMessages && errorType in fieldMessages) {
      return fieldMessages[errorType as keyof typeof fieldMessages];
    }
    return "Invalid input";
  }
}
