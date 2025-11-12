import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService } from 'src/app/services/token/token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router, private tokenService: TokenService,) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const isLoggedIn = this.checkLoginStatus();
    
    if (isLoggedIn) {
      // User is logged in; grant access to the route
      console.log('User is logged in and emails match.');
      return true;
         
    } else {
      // Redirect to login if not logged in
      console.warn('User not logged in or email mismatch.');
      localStorage.clear();
      this.tokenService.clearToken();
      return this.router.createUrlTree(['/authentication/login']);
    }
  }

 
  
  private checkLoginStatus(): boolean {
    const userId = sessionStorage.getItem('login_user_id');
    const tokenEmail = this.tokenService.getEmail();
    const localEmail = localStorage.getItem('email');
    return !!userId && tokenEmail === localEmail;
  }
}
