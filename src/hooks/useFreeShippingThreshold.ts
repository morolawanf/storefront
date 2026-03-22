'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/libs/api/axios';
import api from '@/libs/api/endpoints';

type PublicCheckoutConfig = {
  freeShippingThreshold: number | null;
};

export const useFreeShippingThreshold = () => {
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadThreshold = async () => {
      try {
        const response = await apiClient.get<PublicCheckoutConfig>(api.gig.config);
        if (isCancelled) {
          return;
        }

        const threshold = response.data?.freeShippingThreshold;
        const normalizedThreshold =
          typeof threshold === 'number' && Number.isFinite(threshold) && threshold >= 0
            ? threshold
            : null;

        setFreeShippingThreshold(normalizedThreshold);
      } catch {
        if (!isCancelled) {
          setFreeShippingThreshold(null);
        }
      }
    };

    loadThreshold();

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    freeShippingThreshold,
  };
};
