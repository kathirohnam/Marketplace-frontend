import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { LoadingService } from "../loading/loading.service";
import { environment } from "src/environments/environment";

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private readonly SKIP_LOADING_HEADER = "X-Skip-Loading";

  // Define URL prefixes by HTTP method
  private readonly methodUrlPrefixes: Record<string, string[]> = {
    POST: [
      `${environment.apiBaseUrl}/payment/create-payment-intent`,
      `${environment.apiBaseUrl}/filing-failures/createFiling`,
      `${environment.apiBaseUrl}/company-filings/create`,
      `${environment.apiBaseUrl}/pdf/upload`,
      `${environment.apiBaseUrl}/company/regForm3`,
      `${environment.apiBaseUrl}/company/regForm1`,
      `${environment.apiBaseUrl}/company/regForm2`,
      `${environment.apiBaseUrl}/superfiler/saveSuperFiler`,
      `${environment.apiBaseUrl}/vendor/saveVendor`,
      `${environment.apiBaseUrl}/invoice/generate`,
      `${environment.apiBaseUrl}/consumer/saveConsumer`,
      `${environment.apiBaseUrl}/token/refresh`,
      `${environment.apiBaseUrl}/token/logout`,
    ],
    PUT: [
      `${environment.apiBaseUrl}/vendor/updateVendor`,
      `${environment.apiBaseUrl}/user-wizard/updateProfile`,
      `${environment.apiBaseUrl}/superfiler/updateSuperFiler`,
      `${environment.apiBaseUrl}/consumer/updateConsumer`,
      `${environment.apiBaseUrl}/company/update`,
    ],
    DELETE: [
      `${environment.apiBaseUrl}/vendor/deleteVendor`,
      `${environment.apiBaseUrl}/superfiler/deleteSuperFiler`,
      `${environment.apiBaseUrl}/consumer/deleteConsumer`,
    ],
  };

  constructor(private loadingService: LoadingService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (this.shouldSkipLoading(request)) {
      return next.handle(this.removeSkipLoadingHeader(request));
    }

    const shouldShowLoading = this.shouldShowLoadingIndicator(request);
    if (shouldShowLoading) {
      this.loadingService.show();
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (shouldShowLoading) {
          this.loadingService.hide();
        }
      })
    );
  }

  private shouldSkipLoading(request: HttpRequest<unknown>): boolean {
    return request.headers.has(this.SKIP_LOADING_HEADER);
  }

  private removeSkipLoadingHeader(
    request: HttpRequest<unknown>
  ): HttpRequest<unknown> {
    return request.clone({
      headers: request.headers.delete(this.SKIP_LOADING_HEADER),
    });
  }

  private shouldShowLoadingIndicator(request: HttpRequest<unknown>): boolean {
    const isGetRequest = request.method === "GET";
    // const isHttpsRequest = request.url.startsWith('https://');
    const matchesMethodUrls = this.matchesConfiguredPrefix(request);

    return isGetRequest || matchesMethodUrls;
  }

  private matchesConfiguredPrefix(request: HttpRequest<unknown>): boolean {
    const prefixes = this.methodUrlPrefixes[request.method];
    if (!prefixes) {
      return false;
    }
    return prefixes.some((prefix) => request.url.startsWith(prefix));
  }
}
