'use client';

import React from 'react';
import { EnrichedOrder } from '@/types/order';

interface OrderAddressesProps {
    order: EnrichedOrder;
}

export default function OrderAddresses({ order }: OrderAddressesProps) {
    return (
        <div className="grid sm:grid-cols-2 gap-4">
            {/* Shipping Address */}
            {order.shippingAddress && (
                <div className="p-6 border border-line rounded-xl">
                    <h6 className="text-button-uppercase text-secondary mb-3">
                        {order.deliveryType === 'pickup' ? 'Pickup Information' : 'Shipping Address'}
                    </h6>
                    <div className="text-title leading-relaxed">
                        {order.shippingAddress.address1}
                        {order.shippingAddress.address2 && <>, {order.shippingAddress.address2}</>}
                        <br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        <br />
                        {order.shippingAddress.country}
                    </div>
                </div>
            )}

            {/* Billing Address */}
            {order.billingAddress && (
                <div className="p-6 border border-line rounded-xl">
                    <h6 className="text-button-uppercase text-secondary mb-3">Billing Address</h6>
                    <div className="text-title leading-relaxed">
                        {order.billingAddress.address1}
                        {order.billingAddress.address2 && <>, {order.billingAddress.address2}</>}
                        <br />
                        {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
                        <br />
                        {order.billingAddress.country}
                    </div>
                </div>
            )}
        </div>
    );
}
