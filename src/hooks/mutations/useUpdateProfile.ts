'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import { UserProfile } from '@/hooks/queries/useUserProfile';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  image?: string;
  country?: string;
  dob?: string;
  notifications?: boolean;
}

/**
 * React Query mutation hook to update user profile
 * @returns Mutation function and state
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const response = await apiClient.put<{ data: UserProfile }>('/user/profile', data);
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate user profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};
