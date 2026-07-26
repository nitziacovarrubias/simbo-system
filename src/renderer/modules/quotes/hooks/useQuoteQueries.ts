import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QuoteAdjustmentsInput, QuoteItemInput } from '@shared/types';

export const quoteQueryKeys = {
  project: (projectId: string) => ['quotes', 'project', projectId] as const,
  detail: (quoteId: string) => ['quotes', 'detail', quoteId] as const
};

export function useQuotesByProjectQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: quoteQueryKeys.project(projectId ?? ''),
    queryFn: () => window.simboApi.getQuotesByProjectId(projectId ?? ''),
    enabled: Boolean(projectId)
  });
}

export function useQuoteQuery(quoteId: string | undefined) {
  return useQuery({
    queryKey: quoteQueryKeys.detail(quoteId ?? ''),
    queryFn: () => window.simboApi.getQuoteById(quoteId ?? ''),
    enabled: Boolean(quoteId)
  });
}

function useRefreshQuote(projectId: string, quoteId?: string) {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: quoteQueryKeys.project(projectId) });
    if (quoteId) {
      await queryClient.invalidateQueries({ queryKey: quoteQueryKeys.detail(quoteId) });
    }
    await queryClient.invalidateQueries({ queryKey: ['projects'] });
    await queryClient.invalidateQueries({ queryKey: ['history', projectId] });
  };
}

export function useGenerateQuoteMutation(projectId: string, cuttingListId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => window.simboApi.generateQuote(projectId, cuttingListId),
    onSuccess: async (quote) => {
      queryClient.setQueryData(quoteQueryKeys.detail(quote.id), quote);
      await queryClient.invalidateQueries({ queryKey: quoteQueryKeys.project(projectId) });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useUpdateQuoteItemMutation(projectId: string, quoteId: string) {
  const refresh = useRefreshQuote(projectId, quoteId);
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: Partial<QuoteItemInput> }) =>
      window.simboApi.updateQuoteItem(itemId, input),
    onSuccess: refresh
  });
}

export function useAddQuoteItemMutation(projectId: string, quoteId: string) {
  const refresh = useRefreshQuote(projectId, quoteId);
  return useMutation({
    mutationFn: (input: QuoteItemInput) => window.simboApi.addQuoteItem(quoteId, input),
    onSuccess: refresh
  });
}

export function useRemoveQuoteItemMutation(projectId: string, quoteId: string) {
  const refresh = useRefreshQuote(projectId, quoteId);
  return useMutation({
    mutationFn: (itemId: string) => window.simboApi.removeQuoteItem(itemId),
    onSuccess: refresh
  });
}

export function useUpdateQuoteAdjustmentsMutation(projectId: string, quoteId: string) {
  const refresh = useRefreshQuote(projectId, quoteId);
  return useMutation({
    mutationFn: (input: QuoteAdjustmentsInput) =>
      window.simboApi.updateQuoteAdjustments(quoteId, input),
    onSuccess: refresh
  });
}

export function useApproveQuoteMutation(projectId: string, quoteId: string) {
  const refresh = useRefreshQuote(projectId, quoteId);
  return useMutation({
    mutationFn: (notes: string) => window.simboApi.approveQuote(quoteId, notes),
    onSuccess: refresh
  });
}

export function useRejectQuoteMutation(projectId: string, quoteId: string) {
  const refresh = useRefreshQuote(projectId, quoteId);
  return useMutation({
    mutationFn: (reason: string) => window.simboApi.rejectQuote(quoteId, reason),
    onSuccess: refresh
  });
}

export function useExportQuoteMutation(projectId: string, quoteId: string) {
  const refresh = useRefreshQuote(projectId, quoteId);
  return useMutation({
    mutationFn: () => window.simboApi.exportQuoteToExcel(quoteId),
    onSuccess: refresh
  });
}
