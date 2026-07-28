import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ActivityInput,
  ActivityUpdateInput,
  ArchiveProjectInput,
  CloseProjectInput
} from '@shared/types';

export const scheduleQueryKeys = {
  detail: (projectId: string) => ['schedule', projectId] as const,
  progress: (projectId: string) => ['schedule-progress', projectId] as const
};

function useRefreshSchedule(projectId: string) {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.detail(projectId) }),
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.progress(projectId) }),
      queryClient.invalidateQueries({ queryKey: ['alerts'] }),
      queryClient.invalidateQueries({ queryKey: ['projects'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    ]);
  };
}

export function useScheduleQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: scheduleQueryKeys.detail(projectId ?? ''),
    queryFn: () => window.simboApi.getScheduleByProjectId(projectId ?? ''),
    enabled: Boolean(projectId)
  });
}

export function useProjectProgressQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: scheduleQueryKeys.progress(projectId ?? ''),
    queryFn: () => window.simboApi.getProjectProgressReport(projectId ?? ''),
    enabled: Boolean(projectId)
  });
}

export function useCreateActivityMutation(projectId: string) {
  const refresh = useRefreshSchedule(projectId);
  return useMutation({
    mutationFn: (input: ActivityInput) => window.simboApi.createActivity(projectId, input),
    onSuccess: refresh
  });
}

export function useUpdateActivityMutation(projectId: string) {
  const refresh = useRefreshSchedule(projectId);
  return useMutation({
    mutationFn: ({ activityId, input }: { activityId: string; input: ActivityUpdateInput }) =>
      window.simboApi.updateActivity(activityId, input),
    onSuccess: refresh
  });
}

export function useDeleteActivityMutation(projectId: string) {
  const refresh = useRefreshSchedule(projectId);
  return useMutation({
    mutationFn: (activityId: string) => window.simboApi.deleteActivity(activityId),
    onSuccess: refresh
  });
}

export function useGenerateProjectAlertsMutation(projectId: string) {
  const refresh = useRefreshSchedule(projectId);
  return useMutation({
    mutationFn: () => window.simboApi.generateProjectAlerts(projectId),
    onSuccess: refresh
  });
}

export function useCloseProjectMutation(projectId: string) {
  const refresh = useRefreshSchedule(projectId);
  return useMutation({
    mutationFn: (input: CloseProjectInput) => window.simboApi.closeProject(projectId, input),
    onSuccess: refresh
  });
}

export function useArchiveProjectMutation(projectId: string) {
  const refresh = useRefreshSchedule(projectId);
  return useMutation({
    mutationFn: (input: ArchiveProjectInput) => window.simboApi.archiveProject(projectId, input),
    onSuccess: refresh
  });
}
