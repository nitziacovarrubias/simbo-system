import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RenderSettingsInput } from '@shared/types';

export function useRendersQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: ['renders', projectId],
    queryFn: () => window.simboApi.listRendersByProject(projectId ?? ''),
    enabled: Boolean(projectId)
  });
}

export function useRenderQuery(renderId: string | undefined) {
  return useQuery({
    queryKey: ['render', renderId],
    queryFn: () => window.simboApi.getRenderById(renderId ?? ''),
    enabled: Boolean(renderId)
  });
}

export function useRenderImageQuery(renderId: string | undefined) {
  return useQuery({
    queryKey: ['render-image', renderId],
    queryFn: () => window.simboApi.getRenderImageData(renderId ?? ''),
    enabled: Boolean(renderId)
  });
}

export function useFreeCadStatusQuery() {
  return useQuery({
    queryKey: ['freecad-status'],
    queryFn: () => window.simboApi.getFreeCadStatus(),
    staleTime: 60_000
  });
}

export function usePrepareRenderMutation(projectId: string, designId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RenderSettingsInput) =>
      window.simboApi.prepareProjectRender(projectId, designId, input),
    onSuccess: (render) => {
      queryClient.setQueryData(['render', render.id], render);
      void queryClient.invalidateQueries({ queryKey: ['renders', projectId] });
    }
  });
}

export function useCompleteRenderMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ renderId, imageDataUrl }: { renderId: string; imageDataUrl: string }) =>
      window.simboApi.completeProjectRender(renderId, imageDataUrl),
    onSuccess: (result) => {
      queryClient.setQueryData(['render', result.render.id], result.render);
      void queryClient.invalidateQueries({ queryKey: ['renders', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['render-image', result.render.id] });
    }
  });
}
