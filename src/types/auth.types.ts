export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string | null;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  latitude: number | null;
  longitude: number | null;
  role: string;
  status: string;
  isVerified: boolean;
  acceptedTerms: boolean;
  createdAt: string;
  updatedAt: string;
  traderProfile: any;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  [key: string]: any;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyForgotOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyForgotOtpResponse {
  resetToken: string;
  message?: string;
}

export interface ResetPasswordPayload {
  resetToken: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResendForgotOtpPayload {
  email: string;
}

export interface ResendForgotOtpResponse {
  message: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}
