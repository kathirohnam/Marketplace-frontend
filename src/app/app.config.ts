// app.config.ts
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from "@angular/core";
import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { routes } from "./app.routes";
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from "@angular/router";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideClientHydration } from "@angular/platform-browser";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { LoadingInterceptor } from "./services/interceptor/loading.interceptor";
import { provideLottieOptions } from "ngx-lottie";
import player from "lottie-web";
import { ErrorStateMatcher } from "@angular/material/core";
import { TouchedOnlyErrorStateMatcher } from "./shared/touched-only-error-state-matcher.service";

import { CancelOnNavigateInterceptor } from "./services/interceptor/cancel.interceptor";

// ✅ ng-icons
import * as TablerIcons from "@ng-icons/tabler-icons";
import {
  provideIcons,
  provideNgIconsConfig /* NgIcon not needed here */,
} from "@ng-icons/core";

import { NgScrollbarModule } from "ngx-scrollbar";
import { MaterialModule } from "./material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { provideNativeDateAdapter } from "@angular/material/core";
import { DatePipe } from "@angular/common";
import { NgxStripeModule } from "ngx-stripe";
import { provideEnvironmentNgxMask } from "ngx-mask";
import { AuthInterceptor } from "./services/interceptor/auth.interceptor";
import { ErrorInterceptor } from "./services/interceptor/error.interceptor";

export function HttpLoaderFactory(http: HttpClient): any {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideNativeDateAdapter(),
    DatePipe,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: "enabled",
        anchorScrolling: "enabled",
      }),
      withComponentInputBinding()
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideLottieOptions({ player: () => player }),

    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule,
      MaterialModule,
      NgxStripeModule.forRoot(),
      NgScrollbarModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),

    provideEnvironmentNgxMask(),

    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    TouchedOnlyErrorStateMatcher,
    { provide: ErrorStateMatcher, useExisting: TouchedOnlyErrorStateMatcher },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CancelOnNavigateInterceptor,
      multi: true,
    },

    // ✅ ng-icons config + register ALL Tabler icons
    // provideNgIconsConfig({ size: '24px' }),
    provideIcons(TablerIcons as unknown as Record<string, string>),
    // (or simply) provideIcons(TablerIcons as any),
  ],
};
