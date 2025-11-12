import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { UserModel } from "src/app/models/account-settings";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private userSubject = new BehaviorSubject<UserModel | null>(
    this.getUserFromSession()
  );

  user$ = this.userSubject.asObservable();

  private getUserFromSession(): UserModel | null {
    const stored = sessionStorage.getItem("userData");
    return stored ? JSON.parse(stored) : null;
  }

  updateUser(user: UserModel) {
    sessionStorage.setItem("userData", JSON.stringify(user));
    this.userSubject.next(user);
  }

  getUserSnapshot(): UserModel | null {
    return this.userSubject.value;
  }
}
