/**
 * Example: Using Store Settings in Storefront Components
 * 
 * This file demonstrates how to use the useStoreSettings hook
 * to display store information and apply tax rates.
 */

'use client';

import { useStoreSettings } from '@/hooks/queries/useStoreSettings';
import { getCdnUrl } from '@/libs/cdn-url';
import Image from 'next/image';

// Example 1: Display Store Logo and Name in Header
export function StoreHeader() {
  const { data: settings, isLoading } = useStoreSettings();

  if (isLoading) {
    return <div className="h-16 w-32 animate-pulse bg-gray-200 rounded" />;
  }

  return (
    <div className="flex items-center gap-3">
      {settings?.logoUrl && (
        <Image
          src={getCdnUrl(settings.logoUrl)}
          alt={settings.storeName || 'Store Logo'}
          width={120}
          height={40}
          className="object-contain"
          priority
        />
      )}
      <h1 className="text-xl font-bold">{settings?.storeName}</h1>
    </div>
  );
}

// Example 2: Apply Tax Rate in Cart Calculations
export function CartSummary({ subtotal }: { subtotal: number }) {
  const { data: settings } = useStoreSettings();

  const taxRate = settings?.taxRate || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <div className="border-t pt-4 space-y-2">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>Tax ({taxRate}%)</span>
        <span>${taxAmount.toFixed(2)}</span>
      </div>

      <div className="flex justify-between font-bold text-lg border-t pt-2">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

// Example 3: Display Contact Information in Footer
export function StoreContactInfo() {
  const { data: settings } = useStoreSettings();

  if (!settings) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">{settings.companyName}</h3>

      {settings.address && (
        <address className="not-italic text-sm text-gray-600">
          {settings.address.line1 && <div>{settings.address.line1}</div>}
          {settings.address.line2 && <div>{settings.address.line2}</div>}
          <div>
            {settings.address.city}, {settings.address.state} {settings.address.zip}
          </div>
          {settings.address.country && <div>{settings.address.country}</div>}
        </address>
      )}

      {settings.supportEmail && (
        <div className="text-sm">
          Email: <a href={`mailto:${settings.supportEmail}`} className="text-blue-600 hover:underline">
            {settings.supportEmail}
          </a>
        </div>
      )}

      {settings.supportPhone && (
        <div className="text-sm">
          Phone: <a href={`tel:${settings.supportPhone}`} className="text-blue-600 hover:underline">
            {settings.supportPhone}
          </a>
        </div>
      )}

      {settings.websiteUrl && (
        <div className="text-sm">
          Web: <a href={settings.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {settings.websiteUrl}
          </a>
        </div>
      )}
    </div>
  );
}

// Example 4: Display Store Logo in Multiple Sizes
export function StoreLogo({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const { data: settings } = useStoreSettings();

  if (!settings?.logoUrl) return null;

  const dimensions = {
    small: { width: 80, height: 30 },
    medium: { width: 120, height: 40 },
    large: { width: 180, height: 60 },
  };

  const { width, height } = dimensions[size];

  return (
    <Image
      src={getCdnUrl(settings.logoUrl)}
      alt={settings.storeName || 'Store Logo'}
      width={width}
      height={height}
      className="object-contain"
    />
  );
}

// Example 5: Use Settings for Meta Tags (SEO)
export function useStoreMeta() {
  const { data: settings } = useStoreSettings();

  return {
    title: settings?.storeName || 'Online Store',
    description: `Shop at ${settings?.companyName || 'our store'}`,
    siteName: settings?.storeName,
    url: settings?.websiteUrl,
  };
}

// Example 6: Calculate Order Total with Tax
export function calculateOrderTotal(items: Array<{ price: number; quantity: number }>, taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    taxRate,
    total,
  };
}

// Usage in a component
export function CheckoutSummary({ items }: { items: Array<{ price: number; quantity: number }> }) {
  const { data: settings } = useStoreSettings();
  const taxRate = settings?.taxRate || 0;

  const { subtotal, tax, total } = calculateOrderTotal(items, taxRate);

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Tax ({taxRate}%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <div className="border-t pt-3 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
        Place Order
      </button>
    </div>
  );
}
