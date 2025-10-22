import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import { api } from '@/libs/api/endpoints';
import {
  Address,
  AddAddressInput,
  UpdateAddressInput,
  AddressesResponse,
} from '@/types/user';

// Add new address mutation
export const useAddAddress = (): UseMutationResult<Address, Error, AddAddressInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressData: AddAddressInput) => {
      const response = await apiClient.post<Address>(api.user.addAddress, addressData);

      if (!response.data) {
        throw new Error(response.message || 'Failed to add address');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate addresses query to refetch
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
};

// Update address mutation
interface UpdateAddressVariables {
  addressId: string;
  updates: UpdateAddressInput;
}

export const useUpdateAddress = (): UseMutationResult<Address[], Error, UpdateAddressVariables> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ addressId, updates }: UpdateAddressVariables) => {
      const response = await apiClient.put<Address[]>(api.user.updateAddress(addressId), updates);

      if (!response.data) {
        throw new Error(response.message || 'Failed to update address');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate addresses query to refetch
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
};

// Delete address mutation
export const useDeleteAddress = (): UseMutationResult<null, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      const response = await apiClient.delete<null>(api.user.deleteAddress(addressId));

      if (response.status === 200) {
        return null;
      }

      throw new Error(response.message || 'Failed to delete address');
    },
    onSuccess: () => {
      // Invalidate addresses query to refetch
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
};
