import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { JwtClaims, LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSignal = signal<string | null>(this.getStoredToken());
  private readonly claimsSignal = signal<JwtClaims | null>(this.decodeToken(this.getStoredToken()));

  readonly isAuthenticated = computed(() => !!this.tokenSignal() && !this.isTokenExpired());
  readonly currentUser = computed(() => this.claimsSignal());
  readonly isAdmin = computed(() => this.claimsSignal()?.role === 'ADMIN');
  readonly mustChangePassword = computed(() => this.claimsSignal()?.mustChangePassword ?? false);
  readonly token = computed(() => this.tokenSignal());

  constructor(private api: ApiService, private router: Router) {}

  async login(email: string, password: string): Promise<void> {
    const response = await this.api.post<LoginResponse>('/auth/login', { email, password });
    this.setToken(response.token);
    const claims = this.decodeToken(response.token);
    if (claims?.mustChangePassword) {
      this.router.navigate(['/password-change']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSignal.set(null);
    this.claimsSignal.set(null);
    this.router.navigate(['/login']);
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
    this.tokenSignal.set(token);
    this.claimsSignal.set(this.decodeToken(token));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  decodeToken(token: string | null): JwtClaims | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: parseInt(payload.sub, 10),
        email: payload.email,
        role: payload.role,
        mustChangePassword: payload.mustChangePassword ?? false,
        exp: payload.exp,
      };
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const claims = this.claimsSignal();
    if (!claims) return true;
    return Date.now() >= claims.exp * 1000;
  }
}
