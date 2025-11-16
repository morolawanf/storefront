'use client';

import React, { useState, useMemo } from 'react';
import * as Icon from '@phosphor-icons/react/dist/ssr';
import { useAccountStore } from '@/store/accountStore';
import { useAddresses } from '@/hooks/queries/useAddresses';
import { useAddAddress, useUpdateAddress, useDeleteAddress } from '@/hooks/mutations/useAddressMutations';
import { Address, AddAddressInput } from '@/types/user';
import ConfirmModal from '@/components/Modal/ConfirmModal';
import { useAllShippingConfig } from '@/hooks/useLogisticsLocations';

// Empty address form structure
const emptyAddress: AddAddressInput = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  address1: '',
  address2: '',
  city: '',
  zipCode: '',
  state: '',
  lga: '',
  country: '',
  active: false,
};

export default function MyAddress() {
  const { activeTab } = useAccountStore();

  // State for managing UI
  const [activeId, setActiveId] = useState<number | null>(null);
  const [expandedAddressId, setExpandedAddressId] = useState<string | null>(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    show: boolean;
    addressId: string | null;
  }>({ show: false, addressId: null });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddAddressInput>(emptyAddress);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch addresses
  const { data: addresses = [], isLoading, error: fetchError } = useAddresses();

  // Fetch shipping configurations for logistics dropdowns
  const { data: shippingConfigs, isLoading: isLoadingShippingConfigs } = useAllShippingConfig();

  // Mutations
  const addMutation = useAddAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();

  // Derive available states based on selected country
  const availableStates = useMemo(() => {
    if (!shippingConfigs || !formData.country) return [];
    const selectedCountry = shippingConfigs.find((c) => c.countryName === formData.country);
    return selectedCountry?.states || [];
  }, [shippingConfigs, formData.country]);

  // Derive available LGAs based on selected state
  const availableLGAs = useMemo(() => {
    if (!formData.state) return [];
    const selectedState = availableStates.find((s) => s.name === formData.state);
    return selectedState?.lgas || [];
  }, [availableStates, formData.state]);

  // Derive available cities based on selected state (for reference)
  const availableCities = useMemo(() => {
    if (!formData.state) return [];
    const selectedState = availableStates.find((s) => s.name === formData.state);
    return selectedState?.cities || [];
  }, [availableStates, formData.state]);

  // Don't render if not active tab
  if (activeTab !== 'address') return null;

  // Toggle address expansion
  const toggleAddress = (addressId: string) => {
    setExpandedAddressId(expandedAddressId === addressId ? null : addressId);
    setIsAddingNew(false);
    setEditingId(null);
    setFormErrors({});
  };

  // Handle opening add new address form
  const handleAddNew = () => {
    setIsAddingNew(true);
    setExpandedAddressId(null);
    setEditingId(null);
    setFormData(emptyAddress);
    setFormErrors({});
  };

  // Handle editing existing address
  const handleEdit = (address: Address) => {
    setEditingId(address._id);
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      phoneNumber: address.phoneNumber,
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      zipCode: address.zipCode,
      state: address.state,
      lga: address.lga,
      country: address.country,
      active: address.active,
    });
    setExpandedAddressId(address._id);
    setIsAddingNew(false);
    setFormErrors({});
  };

  // Handle canceling edit/add
  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData(emptyAddress);
    setFormErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    if (!formData.address1.trim()) errors.address1 = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required';
    if (!formData.country) errors.country = 'Country is required';
    if (!formData.state) errors.state = 'State is required';
    if (!formData.lga) errors.lga = 'LGA is required';

    // Validate LGA exists in available options for selected state
    if (formData.lga && formData.state && !availableLGAs?.find(l => l.name === formData.lga)) {
      errors.lga = 'Selected LGA is not valid for this state';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission (add or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingId) {
        // Update existing address
        await updateMutation.mutateAsync({
          addressId: editingId,
          updates: formData,
        });
      } else {
        // Add new address
        await addMutation.mutateAsync(formData);
      }

      // Reset form on success
      handleCancel();
    } catch (error) {
      // Error is handled by mutation error state
      console.error('Form submission error:', error);
    }
  };

  // Handle delete with confirmation
  const handleDeleteClick = (addressId: string, firstName: string, lastName: string) => {
    setDeleteConfirmState({
      show: true,
      addressId,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmState.addressId) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirmState.addressId);
      if (expandedAddressId === deleteConfirmState.addressId) {
        setExpandedAddressId(null);
      }
      // Close modal
      setDeleteConfirmState({ show: false, addressId: null });
    } catch (error) {
      // Error is handled by mutation error state
      console.error('Delete error:', error);
      // Keep modal open to show error
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmState({ show: false, addressId: null });
  };

  // Handle setting active address
  const handleSetActive = async (addressId: string) => {
    try {
      await updateMutation.mutateAsync({
        addressId,
        updates: { active: true },
      });
    } catch (error) {
      console.error('Set active error:', error);
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof AddAddressInput, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Cascading reset logic for location fields
      if (field === 'country') {
        // Reset state and lga when country changes
        updated.state = '';
        updated.lga = '';
      } else if (field === 'state') {
        // Reset lga when state changes
        updated.lga = '';
      }

      return updated;
    });

    // Clear error for this field when user starts typing
    if (formErrors[field as string]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="tab_address text-content w-full p-7 border border-line rounded-xl">
        <div className="flex items-center justify-center py-12">
          <Icon.CircleNotch className="text-4xl animate-spin text-black" />
          <span className="ml-3 text-secondary">Loading addresses...</span>
        </div>
      </div>
    );
  }

  // Error state (fetch error)
  if (fetchError) {
    return (
      <div className="tab_address text-content w-full p-7 border border-line rounded-xl">
        <div className="flex items-center gap-3 p-4 bg-red/10 border border-red rounded-lg text-red">
          <Icon.WarningCircle className="text-2xl flex-shrink-0" />
          <div>
            <div className="font-semibold">Failed to load addresses</div>
            <div className="text-sm mt-1">{fetchError.message}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab_address text-content w-full p-3.5 md:p-7 border border-line rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h6 className="heading6">My Addresses</h6>
        <button
          type="button"
          onClick={handleAddNew}
          className="flex items-center gap-2 p-2.5 bg-black text-white rounded-md hover:bg-black/90 transition-all"
          disabled={isAddingNew}
        >
          <Icon.Plus className="text-xl" />
          <span className="text-button hidden md:block">Add New Address</span>
        </button>
      </div>

      {/* Mutation errors */}
      {(addMutation.isError || updateMutation.isError || deleteMutation.isError) && (
        <div className="mb-6 p-4 bg-red/10 border border-red rounded-lg text-red">
          <div className="flex items-start gap-3">
            <Icon.WarningCircle className="text-2xl flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Operation Failed</div>
              <div className="text-sm mt-1">
                {addMutation.error?.message ||
                  updateMutation.error?.message ||
                  deleteMutation.error?.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add new address form */}
      {isAddingNew && (
        <div className="mb-6 p-6 border-2 border-black rounded-xl bg-surface">
          <div className="flex items-center justify-between mb-4">
            <h6 className="heading6">New Address</h6>
            <button
              type="button"
              onClick={handleCancel}
              className="text-secondary hover:text-black transition-colors"
            >
              <Icon.X className="text-2xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4 gap-y-5">
              {/* First Name */}
              <div>
                <label htmlFor="newFirstName" className="caption1 capitalize">
                  First Name <span className="text-red">*</span>
                </label>
                <input
                  className={`border-line mt-2 px-4 py-3 w-full rounded-lg ${formErrors.firstName ? 'border-red' : ''
                    }`}
                  id="newFirstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
                {formErrors.firstName && (
                  <div className="text-red text-xs mt-1">{formErrors.firstName}</div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="newLastName" className="caption1 capitalize">
                  Last Name <span className="text-red">*</span>
                </label>
                <input
                  className={`border-line mt-2 px-4 py-3 w-full rounded-lg ${formErrors.lastName ? 'border-red' : ''
                    }`}
                  id="newLastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
                {formErrors.lastName && (
                  <div className="text-red text-xs mt-1">{formErrors.lastName}</div>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="newPhone" className="caption1 capitalize">
                  Phone <span className="text-red">*</span>
                </label>
                <input
                  className={`border-line mt-2 px-4 py-3 w-full rounded-lg ${formErrors.phoneNumber ? 'border-red' : ''
                    }`}
                  id="newPhone"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
                {formErrors.phoneNumber && (
                  <div className="text-red text-xs mt-1">{formErrors.phoneNumber}</div>
                )}
              </div>

              {/* Country */}
              <div>
                <label htmlFor="newCountry" className="caption1 capitalize">
                  Country / Region <span className="text-red">*</span>
                </label>
                <div className="relative">
                  <select
                    className={`border-line mt-2 px-4 py-3 w-full rounded-lg appearance-none ${formErrors.country ? 'border-red' : ''
                      } ${isLoadingShippingConfigs ? 'pr-10' : ''}`}
                    id="newCountry"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={isLoadingShippingConfigs}
                  >
                    <option value="">Choose Country</option>
                    {shippingConfigs?.map((config) => (
                      <option key={config.countryCode} value={config.countryName}>
                        {config.countryName}
                      </option>
                    ))}
                  </select>
                  {isLoadingShippingConfigs && (
                    <Icon.CircleNotch className="absolute right-3 top-1/2 -translate-y-1/2 text-xl animate-spin text-secondary" />
                  )}
                </div>
                {formErrors.country && (
                  <div className="text-red text-xs mt-1">{formErrors.country}</div>
                )}
              </div>

              {/* Address 1 */}
              <div className="sm:col-span-2">
                <label htmlFor="newAddress1" className="caption1 capitalize">
                  Street Address <span className="text-red">*</span>
                </label>
                <input
                  className={`border-line mt-2 px-4 py-3 w-full rounded-lg ${formErrors.address1 ? 'border-red' : ''
                    }`}
                  id="newAddress1"
                  type="text"
                  value={formData.address1}
                  onChange={(e) => handleInputChange('address1', e.target.value)}
                />
                {formErrors.address1 && (
                  <div className="text-red text-xs mt-1">{formErrors.address1}</div>
                )}
              </div>

              {/* Address 2 */}
              <div className="sm:col-span-2">
                <label htmlFor="newAddress2" className="caption1 capitalize">
                  Apartment, suite, etc. (optional)
                </label>
                <input
                  className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                  id="newAddress2"
                  type="text"
                  value={formData.address2}
                  onChange={(e) => handleInputChange('address2', e.target.value)}
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="newCity" className="caption1 capitalize">
                  Town / City <span className="text-red">*</span>
                </label>
                <input
                  className={`border-line mt-2 px-4 py-3 w-full rounded-lg ${formErrors.city ? 'border-red' : ''
                    }`}
                  id="newCity"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
                {formErrors.city && (
                  <div className="text-red text-xs mt-1">{formErrors.city}</div>
                )}
              </div>

              {/* State */}
              <div>
                <label htmlFor="newState" className="caption1 capitalize">
                  State <span className="text-red">*</span>
                </label>
                <select
                  className={`border-line mt-2 px-4 py-3 w-full rounded-lg appearance-none ${formErrors.state ? 'border-red' : ''
                    }`}
                  id="newState"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={isLoadingShippingConfigs || !formData.country || !availableStates.length}
                >
                  <option value="">Choose State</option>
                  {availableStates?.map((state) => (
                    <option key={state.name} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {formErrors.state && (
                  <div className="text-red text-xs mt-1">{formErrors.state}</div>
                )}
              </div>

              {/* LGA */}
              <div>
                <label htmlFor="newLga" className="caption1 capitalize">
                  LGA <span className="text-red">*</span>
                </label>
                <select
                  className={`border-line mt-2 px-4 py-3 w-full rounded-lg appearance-none ${formErrors.lga ? 'border-red' : ''
                    }`}
                  id="newLga"
                  value={formData.lga}
                  onChange={(e) => handleInputChange('lga', e.target.value)}
                  disabled={!formData.state || !availableLGAs.length}
                >
                  <option value="">Choose LGA</option>
                  {availableLGAs?.map((lga) => (
                    <option key={lga.name} value={lga.name}>
                      {lga.name}
                    </option>
                  ))}
                </select>
                {formErrors.lga && (
                  <div className="text-red text-xs mt-1">{formErrors.lga}</div>
                )}
              </div>

              {/* ZIP Code */}
              <div>
                <label htmlFor="newZip" className="caption1 capitalize">
                  ZIP Code <span className="text-red">*</span>
                </label>
                <input
                  className={`border-line mt-2 px-4 py-3 w-full rounded-lg ${formErrors.zipCode ? 'border-red' : ''
                    }`}
                  id="newZip"
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                />
                {formErrors.zipCode && (
                  <div className="text-red text-xs mt-1">{formErrors.zipCode}</div>
                )}
              </div>

              {/* Set as Active */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="caption1">Set as active address</span>
                </label>
              </div>
            </div>

            {/* Form buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="button-main"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? 'Adding...' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-line rounded-lg hover:bg-surface transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty state */}
      {addresses.length === 0 && !isAddingNew && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Icon.MapPin className="text-6xl text-secondary mb-4" />
          <h6 className="heading6 mb-2">No addresses yet</h6>
          <p className="text-secondary mb-6">Add your first address to get started</p>
          <button
            onClick={handleAddNew}
            className="button-main"
          >
            Add Address
          </button>
        </div>
      )}

      {/* Address list */}
      {addresses.length > 0 && (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`border rounded-xl overflow-hidden transition-all ${address.active ? 'border-black border-2' : 'border-line'
                }`}
            >
              {/* Address header */}
              <button
                type="button"
                className="tab_btn flex items-center justify-between w-full p-4 hover:bg-surface transition-colors"
                onClick={() => toggleAddress(address._id)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <strong className="heading6">
                        {address.firstName} {address.lastName}
                      </strong>
                      {address.active && (
                        <span className="text-xs px-2 py-0.5 bg-black text-white rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-secondary text-sm mt-1">
                      {address.address1}, {address.city}, {address.state}
                    </p>
                  </div>
                </div>
                <Icon.CaretDown
                  className={`text-2xl transition-transform duration-300 ${expandedAddressId === address._id ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {/* Address details (expanded) */}
              {expandedAddressId === address._id && (
                <div className="p-6 border-t border-line bg-surface">
                  {editingId === address._id ? (
                    /* Edit form */
                    <form onSubmit={handleSubmit}>
                      <div className="grid sm:grid-cols-2 gap-4 gap-y-5">
                        {/* Same form fields as add new - abbreviated for space */}
                        <div>
                          <label className="caption1 capitalize">
                            First Name <span className="text-red">*</span>
                          </label>
                          <input
                            className={`border-line mt-2 px-4 py-3 w-full rounded-lg ${formErrors.firstName ? 'border-red' : ''
                              }`}
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                          />
                          {formErrors.firstName && (
                            <div className="text-red text-xs mt-1">{formErrors.firstName}</div>
                          )}
                        </div>

                        <div>
                          <label className="caption1 capitalize">
                            Last Name <span className="text-red">*</span>
                          </label>
                          <input
                            className={`border-line mt-2 px-4 py-3 w-full rounded-lg ${formErrors.lastName ? 'border-red' : ''
                              }`}
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                          />
                          {formErrors.lastName && (
                            <div className="text-red text-xs mt-1">{formErrors.lastName}</div>
                          )}
                        </div>

                        <div>
                          <label className="caption1 capitalize">
                            Phone <span className="text-red">*</span>
                          </label>
                          <input
                            className={`border-line mt-2 px-4 py-3 w-full rounded-lg ${formErrors.phoneNumber ? 'border-red' : ''
                              }`}
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          />
                          {formErrors.phoneNumber && (
                            <div className="text-red text-xs mt-1">{formErrors.phoneNumber}</div>
                          )}
                        </div>

                        <div>
                          <label className="caption1 capitalize">
                            Country / Region <span className="text-red">*</span>
                          </label>
                          <div className="relative">
                            <select
                              className={`border-line mt-2 px-4 py-3 w-full rounded-lg appearance-none ${formErrors.country ? 'border-red' : ''
                                } ${isLoadingShippingConfigs ? 'pr-10' : ''}`}
                              value={formData.country}
                              onChange={(e) => handleInputChange('country', e.target.value)}
                              disabled={isLoadingShippingConfigs}
                            >
                              <option value="">Choose Country</option>
                              {shippingConfigs?.map((config) => (
                                <option key={config.countryCode} value={config.countryName}>
                                  {config.countryName}
                                </option>
                              ))}
                            </select>
                            {isLoadingShippingConfigs && (
                              <Icon.CircleNotch className="absolute right-3 top-1/2 -translate-y-1/2 text-xl animate-spin text-secondary" />
                            )}
                          </div>
                          {formErrors.country && (
                            <div className="text-red text-xs mt-1">{formErrors.country}</div>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="caption1 capitalize">
                            Street Address <span className="text-red">*</span>
                          </label>
                          <input
                            className={`border-line mt-2 px-4 py-3 w-full rounded-lg ${formErrors.address1 ? 'border-red' : ''
                              }`}
                            type="text"
                            value={formData.address1}
                            onChange={(e) => handleInputChange('address1', e.target.value)}
                          />
                          {formErrors.address1 && (
                            <div className="text-red text-xs mt-1">{formErrors.address1}</div>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="caption1 capitalize">
                            Apartment, suite, etc. (optional)
                          </label>
                          <input
                            className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                            type="text"
                            value={formData.address2}
                            onChange={(e) => handleInputChange('address2', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="caption1 capitalize">
                            State <span className="text-red">*</span>
                          </label>
                          <select
                            className={`border-line mt-2 px-4 py-3 w-full rounded-lg appearance-none ${formErrors.state ? 'border-red' : ''
                              }`}
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            disabled={isLoadingShippingConfigs || !formData.country || !availableStates.length}
                          >
                            <option value="">Choose State</option>
                            {availableStates?.map((state) => (
                              <option key={state.name} value={state.name}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                          {formErrors.state && (
                            <div className="text-red text-xs mt-1">{formErrors.state}</div>
                          )}
                        </div>

                        <div>
                          <label className="caption1 capitalize">
                            LGA <span className="text-red">*</span>
                          </label>
                          <select
                            className={`border-line mt-2 px-4 py-3 w-full rounded-lg appearance-none ${formErrors.lga ? 'border-red' : ''
                              }`}
                            value={formData.lga}
                            onChange={(e) => handleInputChange('lga', e.target.value)}
                            disabled={!formData.state || !availableLGAs.length}
                          >
                            <option value="">Choose LGA</option>
                            {availableLGAs?.map((lga) => (
                              <option key={lga.name} value={lga.name}>
                                {lga.name}
                              </option>
                            ))}
                          </select>
                          {formErrors.lga && (
                            <div className="text-red text-xs mt-1">{formErrors.lga}</div>
                          )}
                        </div>


                        <div>
                          <label className="caption1 capitalize">
                            Town / City <span className="text-red">*</span>
                          </label>
                          <input
                            className={`border-line mt-2 px-4 py-3 w-full rounded-lg ${formErrors.city ? 'border-red' : ''
                              }`}
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                          />
                          {formErrors.city && (
                            <div className="text-red text-xs mt-1">{formErrors.city}</div>
                          )}
                        </div>

                        <div>
                          <label className="caption1 capitalize">
                            ZIP Code <span className="text-red">*</span>
                          </label>
                          <input
                            className={`border-line mt-2 px-4 py-3 w-full rounded-lg ${formErrors.zipCode ? 'border-red' : ''
                              }`}
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          />
                          {formErrors.zipCode && (
                            <div className="text-red text-xs mt-1">{formErrors.zipCode}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          type="submit"
                          className="button-main"
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? 'Updating...' : 'Update Address'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-6 py-3 border border-line rounded-lg hover:bg-white transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* View mode */
                    <>
                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="text-secondary text-sm mb-1">Full Name</div>
                          <div className="text-title font-semibold">
                            {address.firstName} {address.lastName}
                          </div>
                        </div>
                        <div>
                          <div className="text-secondary text-sm mb-1">Phone</div>
                          <div className="text-title">{address.phoneNumber}</div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="text-secondary text-sm mb-1">Address</div>
                          <div className="text-title">
                            {address.address1}
                            {address.address2 && <>, {address.address2}</>}
                            <br />
                            {address.city}, {address.state} {address.zipCode}
                            <br />
                            {address.lga && <>{address.lga}<br /></>}
                            {address.country}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-3">
                        {!address.active && (
                          <button
                            onClick={() => handleSetActive(address._id)}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-all text-sm font-semibold"
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending ? 'Setting...' : 'Set as Active'}
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(address)}
                          className="px-4 py-2 border border-line rounded-lg hover:bg-white transition-all text-sm font-semibold"
                        >
                          <Icon.PencilSimple className="inline-block mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(address._id, address.firstName, address.lastName)}
                          className="px-4 py-2 border border-red text-red rounded-lg hover:bg-red hover:text-white transition-all text-sm font-semibold"
                          disabled={deleteMutation.isPending}
                        >
                          <Icon.Trash className="inline-block mr-1" />
                          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmState.show}
        title="Delete Address"
        message={`Are you sure you want to delete the address? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
