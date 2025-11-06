'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'
import productData from '@/data/Product.json'
import Product from '@/components/Product/Product'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCompare } from '@/context/CompareContext'
import { useCart } from '@/context/CartContext'
import { useModalCartContext } from '@/context/ModalCartContext'
import Rate from '@/components/Other/Rate'
import { getCdnUrl } from '@/libs/cdn-url'
import type { ProductSpecification, ProductDimension } from '@/types/product'

const Compare = () => {
    const { compareState } = useCompare();
    const { cartState, addToCart, updateCart } = useCart();
    const { openModalCart } = useModalCartContext();

    const handleAddToCart = (productItem: ProductType) => {
        if (!cartState.cartArray.find(item => item.id === productItem.id)) {
            addToCart({ ...productItem });
            updateCart(productItem.id, productItem.quantityPurchase, '', '')
        } else {
            updateCart(productItem.id, productItem.quantityPurchase, '', '')
        }
        openModalCart()
    };

    // Helper: pick best image for compare – prefer description_images cover, then first description image,
    // then cover from images, then first image. Returns raw URL (to be wrapped with getCdnUrl).
    const selectCompareImage = (product: ProductType): string => {
        const descCover = product.description_images?.find((img) => img.cover_image)?.url
        if (descCover) return descCover
        const firstDesc = product.description_images?.[0]?.url
        if (firstDesc) return firstDesc
        const imagesCover = product.images?.find((img) => img.cover_image)?.url
        if (imagesCover) return imagesCover
        return product.images?.[0]?.url ?? ''
    }

    // Narrow types to include optional specs and dimensions without changing global ProductType
    type WithSpecsDims = {
        specifications?: ProductSpecification[];
        dimension?: ProductDimension[];
    };

    const products = compareState.compareArray as Array<ProductType & WithSpecsDims>;

    const normalizeKey = (s: string) => s.trim().toLowerCase();

    // Build merged specification rows
    const specKeyToLabel = new Map<string, string>();
    products.forEach(p => (p.specifications ?? []).forEach(spec => {
        const norm = normalizeKey(spec.key);
        if (!specKeyToLabel.has(norm)) specKeyToLabel.set(norm, spec.key);
    }));
    const mergedSpecs = Array.from(specKeyToLabel.entries()).map(([norm, label]) => ({
        label,
        values: products.map(p => (p.specifications ?? []).find(s => normalizeKey(s.key) === norm)?.value ?? ''),
    }));

    // Build merged dimension rows
    const dimOrder: Array<ProductDimension['key']> = ['length', 'breadth', 'height', 'volume', 'width', 'weight'];
    const dimKeysSet = new Set<string>();
    products.forEach(p => (p.dimension ?? []).forEach(d => dimKeysSet.add(d.key)));
    const orderedDimKeys = [
        ...dimOrder.filter(k => dimKeysSet.has(k)),
        ...Array.from(dimKeysSet).filter(k => !dimOrder.includes(k as ProductDimension['key'])),
    ];
    const mergedDims = orderedDimKeys.map(key => ({
        key,
        values: products.map(p => (p.dimension ?? []).find(d => d.key === key)?.value ?? ''),
    }));

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Compare Products' subHeading='Compare Products' />
            </div>
            <div className="compare-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main">
                        <div>
                            <div className="list-product flex">
                                <div className="left lg:w-[240px] w-[170px] flex-shrink-0"></div>
                                <div className="right flex w-full border border-line rounded-t-2xl border-b-0">
                                    {compareState.compareArray.map(item => (
                                        <div className="product-item px-10 pt-6 pb-5 border-r border-line" key={item.id}>
                                            <div className="bg-img w-full aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={getCdnUrl(selectCompareImage(item))}
                                                    width={1000}
                                                    height={1500}
                                                    alt={item.name}
                                                    className='w-full h-full object-cover'
                                                />
                                            </div>
                                            <div className="text-title text-center mt-4">{item.name}</div>
                                            <div className="caption2 font-semibold text-secondary2 uppercase text-center mt-1">{item.brand}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="compare-table flex">
                                <div className="left lg:w-[240px] w-[170px] flex-shrink-0 border border-line border-r-0 rounded-l-2xl">
                                    <div className="item text-button flex items-center h-[60px] px-8 w-full border-b border-line">Rating</div>
                                    <div className="item text-button flex items-center h-[60px] px-8 w-full border-b border-line">Price</div>
                                    <div className="item text-button flex items-center h-[60px] px-8 w-full border-b border-line">Type</div>
                                    <div className="item text-button flex items-center h-[60px] px-8 w-full border-b border-line">Brand</div>
                                    <div className="item text-button flex items-center h-[60px] px-8 w-full border-b border-line">Size</div>
                                    <div className="item text-button flex items-center h-[60px] px-8 w-full border-b border-line">Colors</div>
                                    <div className="item text-button flex items-center h-[60px] px-8 w-full border-b border-line">Metarial</div>
                                    <div className="item text-button flex items-center h-[60px] px-8 w-full border-b border-line">Add To Cart</div>
                                    {/* Dynamic Specifications */}
                                    {mergedSpecs.map((row) => (
                                        <div key={`spec-left-${row.label}`} className="item text-button flex items-center h-[60px] px-8 w-full border-b border-line">
                                            {row.label}
                                        </div>
                                    ))}
                                    {/* Dynamic Dimensions */}
                                    {mergedDims.map((row) => (
                                        <div key={`dim-left-${row.key}`} className="item text-button flex items-center h-[60px] px-8 w-full border-b border-line capitalize">
                                            {row.key}
                                        </div>
                                    ))}
                                </div>
                                <table className="right border-collapse w-full border-t border-r border-line">
                                    <tr className={`flex w-full items-center`}>
                                        {compareState.compareArray.map((item, index) => (
                                            <td className="w-full border border-line h-[60px] border-t-0 border-r-0" key={index}>
                                                <div className='h-full flex items-center justify-center'>
                                                    <Rate currentRate={item.rate} size={12} />
                                                    <p className='pl-1'>(1.234)</p>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className={`flex w-full items-center`}>
                                        {compareState.compareArray.map((item, index) => (
                                            <td className="w-full border border-line h-[60px] border-t-0 border-r-0" key={index}>
                                                <div className='h-full flex items-center justify-center'>
                                                    ${item.price}.00
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className={`flex w-full items-center`}>
                                        {compareState.compareArray.map((item, index) => (
                                            <td className="w-full border border-line h-[60px] border-t-0 border-r-0" key={index}>
                                                <div className='h-full flex items-center justify-center capitalize'>
                                                    {item.type}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className={`flex w-full items-center`}>
                                        {compareState.compareArray.map((item, index) => (
                                            <td className="w-full border border-line h-[60px] border-t-0 border-r-0" key={index}>
                                                <div className='h-full flex items-center justify-center capitalize'>
                                                    {item.brand}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className={`flex w-full items-center`}>
                                        {compareState.compareArray.map((item, index) => (
                                            <td className="w-full border border-line h-[60px] border-t-0 border-r-0 size" key={index}>
                                                <div className='h-full flex items-center justify-center capitalize gap-1'>
                                                    {item.sizes.map((size, i) => (
                                                        <p key={i}>{size}
                                                            <span>,</span>
                                                        </p>
                                                    ))}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className={`flex w-full items-center`}>
                                        {compareState.compareArray.map((item, index) => (
                                            <td className="w-full border border-line h-[60px] border-t-0 border-r-0 size" key={index}>
                                                <div className='h-full flex items-center justify-center capitalize gap-2'>
                                                    {item.variation.map((colorItem, i) => (
                                                        <span
                                                            key={i}
                                                            className={`w-6 h-6 rounded-full`}
                                                            style={{ backgroundColor: `${colorItem.colorCode}` }}
                                                        ></span>
                                                    ))}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className={`flex w-full items-center`}>
                                        {compareState.compareArray.map((item, index) => (
                                            <td className="w-full border border-line h-[60px] border-t-0 border-r-0" key={index}>
                                                <div className='h-full flex items-center justify-center capitalize'>
                                                    Cotton
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className={`flex w-full items-center`}>
                                        {compareState.compareArray.map((item, index) => (
                                            <td className="w-full border border-line h-[60px] border-t-0 border-r-0" key={index}>
                                                <div className='h-full flex items-center justify-center'>
                                                    <div className='button-main py-1.5 px-5' onClick={() => handleAddToCart(item)}>Add To Cart</div>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Dynamic Specification rows */}
                                    {mergedSpecs.map((row, rIdx) => (
                                        <tr key={`spec-row-${rIdx}`} className={`flex w-full items-center`}>
                                            {row.values.map((val, cIdx) => (
                                                <td key={cIdx} className="w-full border border-line h-[60px] border-t-0 border-r-0">
                                                    <div className='h-full flex items-center justify-center'>
                                                        {val || '-'}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {/* Dynamic Dimension rows */}
                                    {mergedDims.map((row, rIdx) => (
                                        <tr key={`dim-row-${rIdx}`} className={`flex w-full items-center`}>
                                            {row.values.map((val, cIdx) => (
                                                <td key={cIdx} className="w-full border border-line h-[60px] border-t-0 border-r-0">
                                                    <div className='h-full flex items-center justify-center capitalize'>
                                                        {val || '-'}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Compare