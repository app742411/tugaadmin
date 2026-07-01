import { apiClient } from "./apiClient";
import { storage } from "@/lib/storage";
import {
  LoginResponse,
  ForgotPasswordResponse,
  VerifyForgotOtpResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  ResendForgotOtpResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  UserProfile,
} from "@/types/auth.types";

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/api/auth/login", { email, password });
    const data = response.data;
    
    // Persist session tokens and user profile
    if (data.accessToken && data.user) {
      storage.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        storage.setRefreshToken(data.refreshToken);
      }
      storage.setUser(data.user);
    }

    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      storage.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>("/api/auth/forgot-password", { email });
    return response.data;
  },

  verifyForgotOtp: async (email: string, otp: string): Promise<VerifyForgotOtpResponse> => {
    const response = await apiClient.post<VerifyForgotOtpResponse>("/api/auth/verify-forgot-otp", {
      email,
      otp,
    });
    return response.data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>("/api/auth/reset-password", payload);
    return response.data;
  },

  resendForgotOtp: async (email: string): Promise<ResendForgotOtpResponse> => {
    const response = await apiClient.post<ResendForgotOtpResponse>("/api/auth/resend-forgot-otp", {
      email,
    });
    return response.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
    const response = await apiClient.post<ChangePasswordResponse>("/api/auth/change-password", payload);
    return response.data;
  },
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>("/api/auth/getMyProfile");
    return response.data;
  },
  updateProfile: async (payload: FormData | Partial<UserProfile>): Promise<UserProfile> => {
    const headers = payload instanceof FormData
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" };
    const response = await apiClient.put<UserProfile>("/api/auth/updateProfile", payload, { headers });
    return response.data;
  },
};
