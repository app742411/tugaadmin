import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moderationService } from "@/services/moderationService";
import { ModerationFlag } from "@/types/moderation.types";

export const useModerationFlags = () => {
  const { data = [], isLoading, error, refetch } = useQuery<ModerationFlag[]>({
    queryKey: ["moderation-flags"],
    queryFn: () => moderationService.getFlags(),
  });

  return { flags: data, isLoading, error, refetch };
};

export const useApproveFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moderationService.approveFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-flags"] });
    },
  });
};

export const useRejectFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moderationService.rejectFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-flags"] });
    },
  });
};
