import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';


if (!window.location.hostname.includes('localhost')) {
  (["log", "warn", "error", "info", "debug"] as Array<keyof Console>).forEach(
    (fn) => {
      (console[fn] as (...args: any[]) => void) = () => {}; // override to do nothing
    }
  );
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
