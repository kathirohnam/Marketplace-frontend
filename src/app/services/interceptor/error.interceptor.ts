import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {
    console.log("ErrorInterceptor initialized");
    
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        
        // Case 1: No internet / network error
        console.log("ErrorInterceptor: Handling error", error);
        if (!navigator.onLine || error.status === 0) {
          console.error("Network error or No Internet");
          this.router.navigate(["/error"], {
            queryParams: { type: "network" },
          });
        }

        // Case 2: Client Side  Error 
        // else if (error.status >= 400 && error.status < 500) {
        //   console.error("Client Side Error");
        //   this.router.navigate(["/error"], {
        //     queryParams: { type: "client" },
        //   });
        // }

        // Case 3: Internal Server Error (500 / 505)
        else if (error.status >= 500) {
          console.error("Internal Server Error");
          this.router.navigate(["/error"], {
            queryParams: { type: "server" },
          });
        }

        

        return throwError(() => error);
      })
    );
  }
 
}
