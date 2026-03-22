'use client';

import React from 'react';
import Countdown from './Countdown';

interface ProductSaleUiBlock {
    showSaleProgress: boolean;
    percentSold: number;
    availableStock: number;
    soldQuantity: number;
    showFlashSaleCountdown: boolean;
    saleEndDate?: string;
}

interface ProductSalesUIProps {
    saleUi: ProductSaleUiBlock;
}

const ProductSalesLeft: React.FC<ProductSalesUIProps> = ({ saleUi }) => {
    return (
        <>
            {saleUi.showSaleProgress && (
                <div className="product-sold pb-2 mt-4">
                    <div className="progress bg-line h-[3px] md:h-[4px] w-full rounded-full overflow-hidden relative">
                        <div
                            className="progress-sold absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-red-600"
                            style={{ width: `${saleUi.percentSold}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-end gap-3 gap-y-1 flex-wrap mt-1">
                        <div className="text-button-uppercase flex gap-1 items-center">
                            <span className="text-sm text-secondary2">
                                <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent text-sm">
                                    {saleUi.availableStock}
                                </span>
                                /{saleUi.soldQuantity + saleUi.availableStock}
                            </span>
                            <span className="text-secondary text-sm font-bols normal-case">left</span>
                        </div>
                    </div>
                </div>
            )}

            {saleUi.showFlashSaleCountdown && saleUi.saleEndDate && <Countdown endDate={saleUi.saleEndDate} />}
        </>
    );
};

export default ProductSalesLeft;
