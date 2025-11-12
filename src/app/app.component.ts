import { Component, effect, HostListener } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { CommonModule } from "@angular/common";
import { LoadingService } from "./services/loading/loading.service";
import { LottieComponent, AnimationOptions } from "ngx-lottie";
import { Router } from "@angular/router";
import { FloatingChatbotComponent } from "./shared/floating-chatbot/floating-chatbot.component";

@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
    MatProgressBarModule,
    CommonModule,
    LottieComponent, // Add this import
    FloatingChatbotComponent,
  ],
  templateUrl: "./app.component.html",
  styles: [
    `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(3px);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }

      .spinner-message {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: white;
        text-align: center;
      }

      .loading-bar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 10000;
        height: 4px;
      }

      /* Optional: Blue tint for monochrome horse animations */
      ng-lottie svg path {
        fill: #1e7ae1;
      }
    `,
  ],
})
export class AppComponent {
  title = "Spike Angular Admin Template";
  loading = this.loadingService.loading$;

  // Lottie configuration for realistic horse animation
  lottieOptions: AnimationOptions = {
    path: "assets/animations/loading.json",
    loop: true,
    autoplay: true,
  };

  constructor(public loadingService: LoadingService, private router: Router) {
    effect(() => {
      console.log("Loading state changed:", this.loading());
    });
  }
  ngOnInit() {
    window.addEventListener("online", () => {
      console.log("✅ Internet Restored");

      // Double-check actual internet connectivity
      const checkInternet = setInterval(() => {
        fetch("https://www.google.com/favicon.ico", {
          method: "HEAD",
          mode: "no-cors",
        })
          .then(() => {
            console.log("✅ Internet Restored");

            const lastUrl = localStorage.getItem("lastUrl");
            if (lastUrl) {
              const stepMatch = lastUrl.match(/step=(\d+)/);
              const step = stepMatch ? parseInt(stepMatch[1], 10) : null;

              if (step && [10, 11].includes(step)) {
                console.log("Redirecting to dashboard instead of last URL");
                this.router.navigateByUrl("apps/dashboard");
              } else {
                console.log("Navigating back to last URL:", lastUrl);
                this.router.navigateByUrl(lastUrl);
              }

              localStorage.removeItem("lastUrl");
            }
            clearInterval(checkInternet);
          })
          .catch(() => {
            console.warn("❌ Network adapter up, but no actual internet yet");
          });
      }, 5000); // Check every 5 seconds
    });

    window.addEventListener("offline", () => {
      console.log("❌ Internet Lost");
    });
  }

  @HostListener("document:keydown.enter", ["$event"])
  handleEnter(event: KeyboardEvent) {
    const active = document.activeElement as HTMLElement | null;
    if (!active) return;

    const tag = active.tagName.toLowerCase();

    if (tag === "input" && (active as HTMLInputElement).type !== "textarea") {
      const form = (active as HTMLInputElement).form;
      if (form) {
        event.preventDefault();
        (form as any).requestSubmit?.();
      }
      return;
    }

    if (tag === "button" || tag === "a") {
      event.preventDefault();
      active.click();
    }
  }
  @HostListener("window:offline", [])
  onOffline() {
    console.error("🚨 No Internet Connection detected");
    const currentUrl = this.router.url;
    localStorage.setItem("lastUrl", currentUrl);
    this.loadingService.hide(); // stop loader
    this.router.navigate(["/authentication/error"], {
      queryParams: { type: "network" },
    });
  }
}
