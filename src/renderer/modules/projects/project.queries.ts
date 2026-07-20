import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectMutationInput, RoomSpaceInput } from '@shared/types';

export const projectQueryKeys = {
  all: ['projects'] as const,
  detail: (projectId: string) => ['projects', projectId] as const
};

export function useProjectsQuery() {
  return useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: () => window.simboApi.listProjects()
  });
}

export function useProjectQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: projectQueryKeys.detail(projectId ?? ''),
    queryFn: () => window.simboApi.getProjectById(projectId ?? ''),
    enabled: Boolean(projectId)
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProjectMutationInput) => window.simboApi.createProject(input),
    onSuccess: async (project) => {
      queryClient.setQueryData(projectQueryKeys.detail(project.id), project);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      ]);
    }
  });
}

export function useUpdateProjectMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProjectMutationInput) => window.simboApi.updateProject(projectId, input),
    onSuccess: async (project) => {
      queryClient.setQueryData(projectQueryKeys.detail(project.id), project);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      ]);
    }
  });
}

export function useSaveRoomSpaceMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RoomSpaceInput) => window.simboApi.saveProjectRoomSpace(projectId, input),
    onSuccess: async (project) => {
      queryClient.setQueryData(projectQueryKeys.detail(project.id), project);
      await queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
    }
  });
}
