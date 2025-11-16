'use client';

import React from 'react';
import { EnrichedOrder } from '@/types/order';

interface OrderContactInfoProps {
    order: EnrichedOrder;
}

export default function OrderContactInfo({ order }: OrderContactInfoProps) {
    return (
        <div className="p-6 border border-line rounded-xl">
            <h6 className="heading6 mb-4 text-button-uppercase text-secondary">Contact Information</h6>
            <div className="space-y-2">
                <div className="text-title font-semibold">{order.contact.name}</div>
                {order.contact.phone && <div className="text-secondary">{order.contact.phone}</div>}
                {order.contact.email && <div className="text-secondary">{order.contact.email}</div>}
            </div>
        </div>
    );
}
