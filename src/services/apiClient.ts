import axios, { AxiosError } from "axios";
import { storage } from "@/lib/storage";

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "";
};

// Create a configured Axios instance
export const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Variables to handle request queuing during token refresh cycles
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Attach the current Access Token dynamically
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Handle errors globally and perform automatic Token Refresh (401)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Skip refreshing if the request was specifically targeting the login or refresh endpoints
    const isAuthRoute =
      originalRequest.url?.includes("/api/auth/login") ||
      originalRequest.url?.includes("/api/auth/refresh");

    // Automatically attempt token refresh on 401 Unauthorized responses
    if (
      error.response &&
      error.response.status === 401 &&
      !isAuthRoute &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue the request
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = storage.getRefreshToken();
      if (refreshToken) {
        try {
          // Request new access tokens from the backend
          const refreshResponse = await axios.post<{
            accessToken: string;
            refreshToken?: string;
          }>(
            `${getApiUrl()}/api/auth/refresh`,
            { refreshToken },
            {
              headers: {
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

          storage.setAccessToken(accessToken);
          if (newRefreshToken) {
            storage.setRefreshToken(newRefreshToken);
          }

          // Process the queued request backlog with the new token
          processQueue(null, accessToken);
          isRefreshing = false;

          // Retry the original failed request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;

          // If token refresh fails, clear state and redirect to signin
          storage.clear();
          if (typeof window !== "undefined") {
            window.location.href = "/signin";
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, force immediate logout
        storage.clear();
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
      }
    }

    // Standardize all error responses to a consistent ApiError shape
    let message = "A network or server error occurred. Please try again.";
    let status = 500;
    let details = {};

    if (error.response) {
      status = error.response.status;
      const data = error.response.data as any;
      message = data?.message || `Request failed with status code ${status}`;
      details = data || {};
    } else if (error.request) {
      message = "No response was received from the server. Check your connection.";
    } else {
      message = error.message;
    }

    const apiError = {
      message,
      status,
      ...details,
    };

    return Promise.reject(apiError);
  }
);
