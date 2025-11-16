// User types matching backend schema

export interface Address {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address1: string;
  address2?: string;
  city: string;
  zipCode: string;
  state: string;
  lga: string;
  country: string;
  active: boolean;
}

export interface AddAddressInput {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address1: string;
  address2?: string;
  city: string;
  zipCode: string;
  state: string;
  lga: string;
  country: string;
  active?: boolean;
}

export interface UpdateAddressInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zipCode?: string;
  state?: string;
  lga?: string;
  country?: string;
  active?: boolean;
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  dob?: string;
  country?: string;
  role: 'owner' | 'user' | 'manager' | 'employee';
  image: string;
  emailVerified: Date | null;
  address: Address[];
  notifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  image?: string;
  country?: string;
  dob?: string;
  notifications?: boolean;
}

export type AddressesResponse = Address[];

export type UserProfileResponse = UserProfile;
