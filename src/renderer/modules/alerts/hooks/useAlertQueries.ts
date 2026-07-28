import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IncidentAlertInput } from '@shared/types';

export const alertQueryKeys = {
  all: ['alerts', 'all'] as const,
  project: (projectId: string) => ['alerts', 'project', projectId] as const
};

function useRefreshAlerts(projectId?: string) {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: ['alerts'] });
    await queryClient.invalidateQueries({ queryKey: ['schedule'] });
    if (projectId) {
      await queryClient.invalidateQueries({ queryKey: ['schedule-progress', projectId] });
    }
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useAlertsQuery(projectId?: string) {
  return useQuery({
    queryKey: projectId ? alertQueryKeys.project(projectId) : alertQueryKeys.all,
    queryFn: () =>
      projectId ? window.simboApi.getAlertsByProjectId(projectId) : window.simboApi.getAllAlerts()
  });
}

export function useCreateIncidentMutation(projectId?: string) {
  const refresh = useRefreshAlerts(projectId);
  return useMutation({
    mutationFn: ({ targetProjectId, input }: { targetProjectId: string; input: IncidentAlertInput }) =>
      window.simboApi.createIncidentAlert(targetProjectId, input),
    onSuccess: refresh
  });
}

export function useResolveAlertMutation(projectId?: string) {
  const refresh = useRefreshAlerts(projectId);
  return useMutation({
    mutationFn: ({ alertId, notes }: { alertId: string; notes: string }) =>
      window.simboApi.resolveAlert(alertId, notes),
    onSuccess: refresh
  });
}

export function useDismissAlertMutation(projectId?: string) {
  const refresh = useRefreshAlerts(projectId);
  return useMutation({
    mutationFn: ({ alertId, notes }: { alertId: string; notes: string }) =>
      window.simboApi.dismissAlert(alertId, notes),
    onSuccess: refresh
  });
}
