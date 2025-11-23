import React from 'react';
import PrivacyPolicyClient from './PrivacyPolicyClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | OEPlast',
  description: 'Privacy Policy for OEPlast',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
