// src/app/services/token.service.ts
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private secretKey = 'MySecretKey@123'; // 🔒 Use env variable in production

  private getKey(type?: 'id'): string {
    return type === 'id' ? 'idToken' : 'accessToken';
  }

  saveToken(token: string, type?: 'id'): void {
    const encrypted = CryptoJS.AES.encrypt(token, this.secretKey).toString();
    sessionStorage.setItem(this.getKey(type), encrypted);
  }

  getToken(type?: 'id'): string | null {
    const encrypted = sessionStorage.getItem(this.getKey(type));
    if (!encrypted) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      return null;
    }
  }

  getRole(): string | null {
    // Extracts role from the access token
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded['cognito:groups']?.[0] || null;
    } catch {
      return null;
    }
  }

  getEmail(): string | null {
    // Extracts role from the access token
    const token = this.getToken('id');
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded?.['email'] || null;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    const decoded: any = jwtDecode(token);
    const exp = decoded?.exp;
    if (!exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return now >= exp;
  }

  clearToken(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('idToken');
    sessionStorage.clear();
  }
}
