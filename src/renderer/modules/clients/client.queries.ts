import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ClientMutationInput } from '@shared/types';

export const clientQueryKeys = {
  all: ['clients'] as const,
  detail: (clientId: string) => ['clients', clientId] as const
};

export function useClientsQuery() {
  return useQuery({
    queryKey: clientQueryKeys.all,
    queryFn: () => window.simboApi.listClients()
  });
}

export function useClientQuery(clientId: string | undefined) {
  return useQuery({
    queryKey: clientQueryKeys.detail(clientId ?? ''),
    queryFn: () => window.simboApi.getClientById(clientId ?? ''),
    enabled: Boolean(clientId)
  });
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ClientMutationInput) => window.simboApi.createClient(input),
    onSuccess: async (client) => {
      queryClient.setQueryData(clientQueryKeys.detail(client.id), client);
      await queryClient.invalidateQueries({ queryKey: clientQueryKeys.all });
    }
  });
}

export function useUpdateClientMutation(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ClientMutationInput) => window.simboApi.updateClient(clientId, input),
    onSuccess: async (client) => {
      queryClient.setQueryData(clientQueryKeys.detail(client.id), client);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clientQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['projects'] })
      ]);
    }
  });
}
