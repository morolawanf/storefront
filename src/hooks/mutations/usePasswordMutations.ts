import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import api from '@/libs/api/endpoints';

interface SetPasswordInput {
  newPassword: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

const setPassword = async (input: SetPasswordInput): Promise<void> => {
  await apiClient.post(api.auth.setPassword, input);
};

const changePassword = async (input: ChangePasswordInput): Promise<void> => {
  await apiClient.post(api.auth.changePassword, input);
};

export const useSetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setPassword,
    onSuccess: () => {
      // Refetch password status to update UI from "Set Password" to "Change Password"
      queryClient.invalidateQueries({ queryKey: ['passwordStatus'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};
