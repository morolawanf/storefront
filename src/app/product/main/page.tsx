'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import MenuOne from '@/components/Header/Menu/MenuOne';
import BreadcrumbProduct from '@/components/Breadcrumb/BreadcrumbProduct';
import Sale from '@/components/Product/Detail/MainProduct';
import Footer from '@/components/Footer/Footer';
import productData from '@/data/Product.json';

const ProductThumbnailBottom = () => {
    const searchParams = useSearchParams();
    let productId = searchParams.get('id');

    if (productId === null) {
        productId = '1';
    }

    return (
        <>
            {/* <BreadcrumbProduct data={productData} productPage='sale' productId={productId} /> */}
            <Sale data={productData} productId={productId} />
            <Footer />
        </>
    );
};

export default ProductThumbnailBottom;