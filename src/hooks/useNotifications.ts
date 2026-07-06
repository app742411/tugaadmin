import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";
import { NotificationResponse } from "@/types/notification.types";

export const useNotifications = (page = 1, limit = 20) => {
  const { data, isLoading, error, refetch } = useQuery<NotificationResponse>({
    queryKey: ["notifications", page, limit],
    queryFn: () => notificationService.getMyNotifications(page, limit),
  });

  return { notifications: data?.data || [], unreadCount: data?.unreadCount || 0, pagination: data?.pagination, isLoading, error, refetch };
};

export const useReadAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.readAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
