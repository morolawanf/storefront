'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import * as Icon from '@phosphor-icons/react/dist/ssr';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Color from 'color';
import type { CategoryFiltersResponse } from '@/types/product';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface Props {
    filters: CategoryFiltersResponse | undefined;
    isLoading: boolean;
}

const CategoryFilterSidebar: React.FC<Props> = ({ filters, isLoading }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Helper to update URL params
    const updateParam = useCallback((key: string, value: string | string[] | undefined) => {
        const params = new URLSearchParams(searchParams?.toString());
        params.delete('page'); // Reset pagination when filter changes
        params.delete(key);

        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else if (value) {
            params.set(key, value);
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [router, pathname, searchParams]);

    // Get current param values
    const getCurrentParam = useCallback((key: string): string[] => {
        const params = searchParams;
        if (!params) return [];
        const all = params.getAll(key);
        if (all.length > 0) return all;
        const single = params.get(key);
        return single ? [single] : [];
    }, [searchParams]);

    const selectedTags = getCurrentParam('tags');
    const selectedPackSize = getCurrentParam('packSize')[0] || '';
    const inStock = getCurrentParam('inStock')[0] === 'true';
    const minPrice = getCurrentParam('minPrice')[0] || '';
    const maxPrice = getCurrentParam('maxPrice')[0] || '';
    const showOnlySale = getCurrentParam('showOnlySale')[0] === 'true';
    const selectedColors = getCurrentParam('Color');

    // Local state for price range slider (immediate UI feedback)
    const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([0, 100]);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize local price range from URL params
    useEffect(() => {
        if (filters) {
            const currentMinSlider = minPrice
                ? Math.floor((parseFloat(minPrice) / filters.priceRange.max) * 100)
                : 0;
            const currentMaxSlider = maxPrice
                ? Math.floor((parseFloat(maxPrice) / filters.priceRange.max) * 100)
                : 100;
            setLocalPriceRange([currentMinSlider, currentMaxSlider]);
        }
    }, [minPrice, maxPrice, filters]);

    const handlePriceChange = useCallback((values: number | number[]) => {
        if (!filters) return;
        if (Array.isArray(values)) {
            const [min, max] = values;

            // Update local state immediately for UI feedback
            setLocalPriceRange([min, max]);

            // Clear existing debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Debounce the URL update and API call
            debounceTimerRef.current = setTimeout(() => {
                const params = new URLSearchParams(searchParams?.toString());
                params.delete('page');

                // Map slider values (0-100) to actual price range
                const actualMin = Math.floor((min / 100) * filters.priceRange.max);
                const actualMax = Math.floor((max / 100) * filters.priceRange.max);

                if (actualMin > 0) params.set('minPrice', actualMin.toString());
                else params.delete('minPrice');

                if (actualMax < filters.priceRange.max) params.set('maxPrice', actualMax.toString());
                else params.delete('maxPrice');

                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }, 500); // 500ms debounce
        }
    }, [filters, router, pathname, searchParams]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const toggleTag = useCallback((tag: string) => {
        const current = new Set(selectedTags);
        if (current.has(tag)) current.delete(tag);
        else current.add(tag);
        updateParam('tags', Array.from(current));
    }, [selectedTags, updateParam]);

    const togglePackSize = useCallback((size: string) => {
        updateParam('packSize', selectedPackSize === size ? undefined : size);
    }, [selectedPackSize, updateParam]);

    const toggleInStock = useCallback(() => {
        updateParam('inStock', !inStock ? 'true' : undefined);
    }, [inStock, updateParam]);

    const toggleColor = useCallback((color: string) => {
        const current = new Set(selectedColors);
        if (current.has(color)) current.delete(color);
        else current.add(color);
        updateParam('Color', Array.from(current).length > 0 ? Array.from(current) : undefined);
    }, [selectedColors, updateParam]);

    const handleShowOnlySaleChange = () => {
        updateParam('showOnlySale', !showOnlySale ? 'true' : undefined);
    };
    if (isLoading) {
        return (
            <div className="sidebar-main">
                <div className="text-center py-10 text-secondary2">Loading filters...</div>
            </div>
        );
    }

    if (!filters) return null;

    // Extract color attribute from attributes array
    const colorAttribute = filters.attributes?.find(
        attr => attr.name.toLowerCase() === 'color' || attr.name.toLowerCase() === 'colors'
    );

    // Filter out color from remaining attributes
    const nonColorAttributes = filters.attributes?.filter(
        attr => attr.name.toLowerCase() !== 'color' && attr.name.toLowerCase() !== 'colors'
    ) || [];

    // Helper to get color hex code
    const getColorHex = (colorName: string): string => {
        try {
            const originalColor = Color(colorName.toLowerCase());
            return originalColor.mix(Color('#ffffff'), 0.15).hex();
        } catch {
            // Fallback if color parsing fails
            return '#cccccc';
        }
    };

    // Calculate display prices from local slider values
    const displayMinPrice = filters ? Math.floor((localPriceRange[0] / 100) * filters.priceRange.max) : 0;
    const displayMaxPrice = filters ? Math.floor((localPriceRange[1] / 100) * filters.priceRange.max) : 0;

    return (
        <div className='w-full'>
            {/* Sale Filter */}
            <div className="filter-instock pb-8 border-b border-line mt-7">
                <div className="heading6">Sales</div>
                <div className="list-instock mt-2">
                    <div className="instock-item flex items-center justify-between">
                        <div className="left flex items-center cursor-pointer">
                            <div className="block-input">
                                <input
                                    type="checkbox"
                                    name="inStock"
                                    id="inStock"
                                    checked={showOnlySale}
                                    onChange={handleShowOnlySaleChange}
                                />
                                <Icon.CheckSquare size={20} weight="fill" className="icon-checkbox" />
                            </div>
                            <label htmlFor="inStock" className="pl-2 cursor-pointer">
                                Show Only Sale Items
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* In Stock Filter */}
            <div className="filter-instock pb-8 border-b border-line mt-7">
                <div className="heading6">Availability</div>
                <div className="list-instock mt-2">
                    <div className="instock-item flex items-center justify-between">
                        <div className="left flex items-center cursor-pointer">
                            <div className="block-input">
                                <input
                                    type="checkbox"
                                    name="inStock"
                                    id="inStock"
                                    checked={inStock}
                                    onChange={toggleInStock}
                                />
                                <Icon.CheckSquare size={20} weight="fill" className="icon-checkbox" />
                            </div>
                            <label htmlFor="inStock" className="pl-2 cursor-pointer">
                                In Stock Only
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Color Filter */}
            {colorAttribute && colorAttribute.values.length > 0 && (
                <div className="filter-color pb-8 border-b border-line mt-8">
                    <div className="heading6">colors</div>
                    <div className="list-color flex items-center flex-wrap gap-3 gap-y-4 mt-4">
                        {colorAttribute.values.map((colorItem, index) => (
                            <div
                                key={index}
                                className={`color-item px-3 py-[5px] flex items-center justify-center gap-2 rounded-full border border-line cursor-pointer ${selectedColors.includes(colorItem.value) ? 'active' : ''}`}
                                onClick={() => toggleColor(colorItem.value)}
                            >
                                <div
                                    className="w-5 h-5 rounded-full"
                                    style={{ backgroundColor: getColorHex(colorItem.value) }}
                                />
                                <div className="caption1 capitalize">{colorItem.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}




            {/* Pack Sizes Filter */}
            {filters.packSizes.length > 0 && (
                <div className="filter-packsize pb-8 border-b border-line mt-8">
                    <div className="heading6">Pack Size</div>
                    <div className="list-packsize flex items-center flex-wrap gap-3 gap-y-4 mt-2">
                        {filters.packSizes.slice(0, 10).map((pack, index) => (
                            <div
                                key={index}
                                className={`packsize-item text-button px-4 py-2 flex items-center justify-center rounded-full border border-line cursor-pointer ${selectedPackSize === pack.label ? 'active' : ''}`}
                                onClick={() => togglePackSize(pack.label)}
                            >
                                {pack.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Price Range Filter */}
            <div className="filter-price pb-8 border-b border-line mt-8">
                <div className="heading6">Price Range</div>
                <Slider
                    range
                    value={localPriceRange}
                    min={0}
                    max={100}
                    onChange={handlePriceChange}
                    className="mt-5"
                />
                <div className="price-block flex items-center justify-between flex-wrap mt-2">
                    <div className="min flex items-center gap-1">
                        <div>Min price:</div>
                        <div className="price-min">
                            ₦<span>{displayMinPrice || (filters?.priceRange.min ?? 0)}</span>
                        </div>
                    </div>
                    <div className="max flex items-center gap-1">
                        <div>Max price:</div>
                        <div className="price-max">
                            ₦<span>{displayMaxPrice || (filters?.priceRange.max ?? 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tags Filter */}
            {filters.tags.length > 0 && (
                <div className="filter-tags pb-8 border-b border-line mt-8">
                    <div className="heading6">Tags</div>
                    <div className="list-tags mt-2">
                        {filters.tags.slice(0, 15).map((tag, index) => (
                            <div key={index} className="tag-item flex items-center justify-between">
                                <div className="left flex items-center cursor-pointer">
                                    <div className="block-input">
                                        <input
                                            type="checkbox"
                                            name={tag.value}
                                            id={tag.value}
                                            checked={selectedTags.includes(tag.value)}
                                            onChange={() => toggleTag(tag.value)}
                                        />
                                        <Icon.CheckSquare size={20} weight="fill" className="icon-checkbox" />
                                    </div>
                                    <label htmlFor={tag.value} className="capitalize pl-2 cursor-pointer">
                                        {tag.value}
                                    </label>
                                </div>
                                <div className="text-secondary2">
                                    ({tag.count})
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryFilterSidebar;
