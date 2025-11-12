// cancel.interceptor.ts
import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpContextToken,
} from "@angular/common/http";
import { Router, NavigationStart } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LoadingService } from "../loading/loading.service"; // <-- import

export const CANCEL_ON_NAVIGATE = new HttpContextToken<boolean>(() => true);

@Injectable()
export class CancelOnNavigateInterceptor implements HttpInterceptor {
  private static wired = false;
  private static cancel$ = new Subject<void>();

  constructor(private router: Router, private loading: LoadingService) {
    if (!CancelOnNavigateInterceptor.wired) {
      this.router.events.subscribe((e) => {
        if (e instanceof NavigationStart) {
          // 1) cancel in-flight HTTP streams
          CancelOnNavigateInterceptor.cancel$.next();
          // 2) 🔥 force-stop any visible loader (handles edge cases)
          this.loading.reset();
        }
      });
      CancelOnNavigateInterceptor.wired = true;
    }
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const shouldCancel = req.context.get(CANCEL_ON_NAVIGATE);
    const stream = next.handle(req);
    return shouldCancel
      ? stream.pipe(takeUntil(CancelOnNavigateInterceptor.cancel$))
      : stream;
  }
}
