'use client';

import React from 'react';
import * as Icon from '@phosphor-icons/react/dist/ssr';
import { EnrichedOrder } from '@/types/order';

interface OrderTrackingHistoryProps {
    order: EnrichedOrder;
    formatDate: (date: string | Date | undefined) => string;
}

export default function OrderTrackingHistory({ order, formatDate }: OrderTrackingHistoryProps) {
    const hasTrackingHistory = order.shipment?.trackingHistory && order.shipment.trackingHistory.length > 0;
    const hasGigWaybill = order.gigWaybill && order.deliveryType === 'gig';

    if (!hasTrackingHistory && !hasGigWaybill) {
        return null;
    }

    return (
        <div className="p-6 border border-line rounded-xl">
            <h6 className="heading6 mb-4">Tracking History</h6>

            {/* GIG Waybill info */}
            {hasGigWaybill && (
                <div className="flex gap-3 pb-4 border-b border-line mb-4">
                    <Icon.Package className="text-xl text-green-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <div className="font-semibold text-title">GIG Logistics</div>
                        <div className="text-sm text-secondary mt-1">Waybill: <span className="font-semibold text-title">{order.gigWaybill}</span></div>
                    </div>
                </div>
            )}

            {/* GIG pending state */}
            {order.deliveryType === 'gig' && !order.gigWaybill && (
                <div className="flex gap-3 pb-4 border-b border-line mb-4">
                    <Icon.HourglassMedium className="text-xl text-yellow-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <div className="font-semibold text-title">GIG Logistics</div>
                        <div className="text-sm text-secondary mt-1">GIG shipment pending</div>
                    </div>
                </div>
            )}

            {/* Existing tracking history */}
            {hasTrackingHistory && (
                <div className="space-y-4">
                    {order.shipment!.trackingHistory.map((track, index) => (
                        <div key={index} className="flex gap-3 pb-4 border-b border-line last:border-0 last:pb-0">
                            <Icon.MapPin className="text-xl text-secondary flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                {track.location && <div className="font-semibold text-title">{track.location}</div>}
                                {track.description && <div className="text-sm text-secondary mt-1">{track.description}</div>}
                                <div className="text-xs text-secondary mt-1">{formatDate(track.timestamp)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
