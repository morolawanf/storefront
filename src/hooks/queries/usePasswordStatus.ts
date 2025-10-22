import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import api from '@/libs/api/endpoints';

export interface PasswordStatus {
  hasPassword: boolean;
  hasProviderAccount: boolean;
}

const fetchPasswordStatus = async (): Promise<PasswordStatus> => {
  const response = await apiClient.get<PasswordStatus>(api.auth.passwordAndProviderStatus);
  return response.data!;
};

export const usePasswordStatus = () => {
  return useQuery({
    queryKey: ['passwordStatus'],
    queryFn: fetchPasswordStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
