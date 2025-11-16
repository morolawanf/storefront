'use client';

import React from 'react';
import * as Icon from '@phosphor-icons/react/dist/ssr';
import { EnrichedOrder } from '@/types/order';

interface OrderStatusTimelineProps {
    order: EnrichedOrder;
    formatDate: (date: string | Date | undefined) => string;
}

export default function OrderStatusTimeline({ order, formatDate }: OrderStatusTimelineProps) {
    // Handle Cancelled status - only show cancelled
    if (order.status === 'Cancelled') {
        return (
            <div className="p-6 border border-line rounded-xl bg-red/5">
                <h6 className="heading6 mb-4">Order Status</h6>
                <div className="flex items-center gap-4 text-red">
                    <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center text-2xl">
                        <Icon.XCircle weight="fill" />
                    </div>
                    <div>
                        <div className="text-title font-semibold">Order Cancelled</div>
                        <div className="text-sm text-secondary mt-1">{formatDate(order.updatedAt)}</div>
                    </div>
                </div>
            </div>
        );
    }

    // Check if order is in a final state
    const isFinalState = order.status === 'Completed' || order.status === 'Failed';

    // For Pending, Processing, Completed, Failed - show timeline
    // First step is always "Order Placed"
    const allStatuses = [
        {
            key: 'placed',
            label: 'Order Placed',
            icon: <Icon.ShoppingBag weight="fill" />,
            date: order.createdAt,
            completed: true, // Always completed
            show: true, // Always show
        },
        {
            key: 'Processing',
            label: 'Processing',
            icon: <Icon.Package weight="fill" />,
            date: order.status === 'Processing' || order.status === 'Completed' ? order.updatedAt : undefined,
            completed: order.status === 'Processing' || order.status === 'Completed',
            show: order.status === 'Processing' || order.status === 'Completed',
        },
        {
            key: 'Shipped',
            label: 'Shipped',
            icon: <Icon.Truck weight="fill" />,
            date: order.shipment ? order.updatedAt : undefined,
            completed: !!order.shipment || order.status === 'Completed',
            show: order.status === 'Processing' || order.status === 'Completed',
        },
        {
            key: 'Completed',
            label: 'Delivered',
            icon: <Icon.CheckCircle weight="fill" />,
            date: order.deliveredAt,
            completed: order.status === 'Completed',
            show: order.status === 'Completed', // Only show if order is completed
        },
        {
            key: 'Failed',
            label: 'Order Failed',
            icon: <Icon.XCircle weight="fill" />,
            date: order.updatedAt,
            completed: true,
            show: order.status === 'Failed', // Only show if order failed
            isError: true, // Mark as error status
        },
    ];

    // Filter to only show relevant statuses
    const statuses = allStatuses.filter(status => status.show);

    return (
        <div className="p-6 border border-line rounded-xl">
            <h6 className="heading6 mb-6">Order Status</h6>
            <div className="relative">
                {statuses.map((status, index) => {
                    const isLast = index === statuses.length - 1;
                    const isCompleted = status.completed;
                    const isError = status.isError || false;

                    return (
                        <div key={status.key} className="relative">
                            <div className="flex items-start gap-4 pb-8 last:pb-0">
                                <div className="relative z-10">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 transition-all ${isError
                                                ? 'bg-red/10 text-red'
                                                : isCompleted
                                                    ? 'bg-black text-white'
                                                    : 'bg-surface text-secondary'
                                            }`}
                                    >
                                        {status.icon}
                                    </div>
                                </div>
                                <div className="flex-1 pt-2">
                                    <div className={`font-semibold ${isError ? 'text-red' : isCompleted ? 'text-black' : 'text-secondary'}`}>
                                        {status.label}
                                    </div>
                                    {status.date && (
                                        <div className="text-sm text-secondary mt-1">{formatDate(status.date)}</div>
                                    )}
                                </div>
                            </div>

                            {/* Connecting line - dashed for incomplete, solid for completed */}
                            {!isLast && (
                                <div
                                    className={`absolute left-6 top-12 bottom-0 w-0.5 -translate-x-1/2 ${isCompleted && statuses[index + 1]?.completed
                                        ? 'bg-black'
                                        : 'border-l-2 border-dashed border-gray-300'
                                        }`}
                                    style={{ height: 'calc(100% - 3rem)' }}
                                />
                            )}
                        </div>
                    );
                })}

                {/* Show dashed continuation line if order is in progress (not in final state) */}
                {!isFinalState && (
                    <div className="relative pl-6">
                        <div className="border-l-2 border-dashed border-gray-300 h-12 ml-6" />
                        <div className="flex items-center gap-3 text-secondary text-sm mt-2">
                            <Icon.DotsThree className="text-2xl" />
                            <span>More updates coming</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
