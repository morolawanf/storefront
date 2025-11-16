'use client';

import React from 'react';
import { EnrichedOrder } from '@/types/order';

interface OrderPaymentInfoProps {
    order: EnrichedOrder;
    formatDate: (date: string | Date | undefined) => string;
}

export default function OrderPaymentInfo({ order, formatDate }: OrderPaymentInfoProps) {
    return (
        <div className="p-6 border border-line rounded-xl">
            <h6 className="heading6 mb-4 text-button-uppercase text-secondary">Payment Information</h6>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-secondary">Method:</span>
                    <span className="text-title font-semibold capitalize">
                        {order.transaction?.paymentMethod || 'N/A'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-secondary">Status:</span>
                    <span className={`font-semibold ${order.isPaid ? 'text-success' : 'text-yellow'}`}>
                        {order.transaction?.status || (order.isPaid ? 'Paid' : 'Pending')}
                    </span>
                </div>
                {order.isPaid && order.paidAt && (
                    <div className="flex justify-between">
                        <span className="text-secondary">Paid At:</span>
                        <span className="text-title">{formatDate(order.paidAt)}</span>
                    </div>
                )}
                {order.transaction?.reference && (
                    <div className="flex justify-between">
                        <span className="text-secondary">Reference:</span>
                        <span className="text-title text-xs">{order.transaction.reference}</span>
                    </div>
                )}
                {order.shipment?.trackingNumber && (
                    <div className="flex justify-between">
                        <span className="text-secondary">Tracking:</span>
                        <span className="text-title text-xs">{order.shipment.trackingNumber}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
