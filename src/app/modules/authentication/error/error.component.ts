import { Component } from '@angular/core';
import { RouterModule, Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { MaterialModule } from '../../../material.module';
import { CommonModule } from '@angular/common';

@Component({
    selector: "app-error",
    imports: [RouterModule, MaterialModule, CommonModule],
    templateUrl: "./error.component.html"
})
export class AppErrorComponent {
  errorType: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe((params) => {
      this.errorType = params["type"] || "unknown";
    });
    // Prevent back navigation to this error page
     history.pushState(null, "", location.href);
     window.onpopstate = () => {
       history.go(1);
     };
  }
}