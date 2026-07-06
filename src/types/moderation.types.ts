export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface ModerationFlag {
  id: string;
  userId: string;
  contentType: string;
  contentId: string;
  detectedText: string;
  reason: string;
  severity: number;
  status: string;
  reviewedAt: string | null;
  createdAt: string;
  user: UserInfo;
}
