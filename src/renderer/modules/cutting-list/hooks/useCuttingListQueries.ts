import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CuttingPieceInput } from '@shared/types';

export const cuttingListQueryKeys = {
  project: (projectId: string) => ['cutting-lists', 'project', projectId] as const,
  detail: (cuttingListId: string) => ['cutting-lists', 'detail', cuttingListId] as const
};

export function useCuttingListsByProjectQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: cuttingListQueryKeys.project(projectId ?? ''),
    queryFn: () => window.simboApi.getCuttingListsByProjectId(projectId ?? ''),
    enabled: Boolean(projectId)
  });
}

export function useCuttingListQuery(cuttingListId: string | undefined) {
  return useQuery({
    queryKey: cuttingListQueryKeys.detail(cuttingListId ?? ''),
    queryFn: () => window.simboApi.getCuttingListById(cuttingListId ?? ''),
    enabled: Boolean(cuttingListId)
  });
}

function useRefreshCuttingList(projectId: string, cuttingListId?: string) {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: cuttingListQueryKeys.project(projectId) });
    if (cuttingListId) {
      await queryClient.invalidateQueries({ queryKey: cuttingListQueryKeys.detail(cuttingListId) });
    }
    await queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
  };
}

export function useGenerateCuttingListMutation(projectId: string, designId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => window.simboApi.generateCuttingList(projectId, designId ?? ''),
    onSuccess: async (list) => {
      queryClient.setQueryData(cuttingListQueryKeys.detail(list.id), list);
      await queryClient.invalidateQueries({ queryKey: cuttingListQueryKeys.project(projectId) });
    }
  });
}

export function useUpdateCuttingPieceMutation(projectId: string, cuttingListId: string) {
  const refresh = useRefreshCuttingList(projectId, cuttingListId);
  return useMutation({
    mutationFn: ({ pieceId, input }: { pieceId: string; input: Partial<CuttingPieceInput> }) =>
      window.simboApi.updateCuttingPiece(pieceId, input),
    onSuccess: refresh
  });
}

export function useAddManualCuttingPieceMutation(projectId: string, cuttingListId: string) {
  const refresh = useRefreshCuttingList(projectId, cuttingListId);
  return useMutation({
    mutationFn: (input: CuttingPieceInput) =>
      window.simboApi.addManualCuttingPiece(cuttingListId, input),
    onSuccess: refresh
  });
}

export function useRemoveCuttingPieceMutation(projectId: string, cuttingListId: string) {
  const refresh = useRefreshCuttingList(projectId, cuttingListId);
  return useMutation({
    mutationFn: (pieceId: string) => window.simboApi.removeCuttingPiece(pieceId),
    onSuccess: refresh
  });
}

export function useAuthorizeCuttingListMutation(projectId: string, cuttingListId: string) {
  const refresh = useRefreshCuttingList(projectId, cuttingListId);
  return useMutation({
    mutationFn: (notes: string) => window.simboApi.authorizeCuttingList(cuttingListId, notes),
    onSuccess: refresh
  });
}

export function useRejectCuttingListMutation(projectId: string, cuttingListId: string) {
  const refresh = useRefreshCuttingList(projectId, cuttingListId);
  return useMutation({
    mutationFn: (reason: string) => window.simboApi.rejectCuttingList(cuttingListId, reason),
    onSuccess: refresh
  });
}

export function useExportCuttingListMutation(projectId: string, cuttingListId: string) {
  const refresh = useRefreshCuttingList(projectId, cuttingListId);
  return useMutation({
    mutationFn: () => window.simboApi.exportCuttingListToExcel(cuttingListId),
    onSuccess: refresh
  });
}
