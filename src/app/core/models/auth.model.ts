export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { token: string; }
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; }
export interface JwtClaims { userId: number; email: string; role: 'USER' | 'ADMIN'; mustChangePassword: boolean; exp: number; }
