export interface NotificationData {
  traderId?: string;
  companyName?: string;
  jobId?: string;
  escalationCount?: number;
  planId?: string;
  currency?: string;
  planName?: string;
  billingCycle?: string;
  paymentAmount?: string;
  subscriptionId?: string;
  traderProfileId?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: NotificationData;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  message: string;
  data: NotificationItem[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
