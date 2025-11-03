'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, useEffect, MouseEvent } from 'react';
import { useInView } from 'framer-motion';
import { useCategories } from '@/hooks/queries/useCategories';
import { ApiCategory } from '@/types/category';
import { getCdnUrl } from '@/libs/cdn-url';

const NavCategoriesMobile = () => {
    const { data: _CATEGORIES } = useCategories();
    const CATEGORIES = useMemo(() => _CATEGORIES || [], [_CATEGORIES]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll to category section when clicking left sidebar
    const scrollToCategory = (e: MouseEvent, categorySlug: string) => {
        e.stopPropagation()
        const element = document.getElementById(`category-section-${categorySlug}`);
        if (element && containerRef.current) {
            const container = containerRef.current;
            const elementTop = element.offsetTop;
            const containerTop = container.offsetTop;
            const offset = elementTop - containerTop;

            container.scrollTo({
                top: offset,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="flex h-full w-full">
            {/* Left Sidebar - Fixed Categories List */}
            <div className="w-1/3 border-r border-line overflow-y-auto max-h-[calc(100vh-200px)]">
                {CATEGORIES.map((category) => (
                    <div
                        key={category.slug}
                        onClick={(e) => scrollToCategory(e, category.slug)}
                        className={`cursor-pointer pr-[0.5px] py-2.5 text-sm border-b border-line transition-colors duration-200 hover:underline ${activeCategory === category.slug
                            ? 'text-black font-medium'
                            : 'bg-white text-secondary hover:bg-surface'
                            }`}
                    >
                        {category.name}
                    </div>
                ))}
            </div>

            {/* Right Side - Scrollable Subcategories */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] px-2"
            >
                {CATEGORIES.map((category) => (
                    <CategorySection
                        key={category.slug}
                        category={category}
                        onInView={() => setActiveCategory(category.slug)}
                    />
                ))}
            </div>
        </div>
    );
};

interface CategorySectionProps {
    category: ApiCategory;
    onInView: () => void;
}

const CategorySection = ({ category, onInView }: CategorySectionProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, {
        margin: '-50% 0px -50% 0px', // Trigger when section is in the middle 20% of viewport
    });

    useEffect(() => {
        if (isInView) {
            onInView();
        }
    }, [isInView, onInView]);

    return (
        <div
            ref={ref}
            id={`category-section-${category.slug}`}
            className="py-4 border-b border-line last:border-b-0 my-5 "
        >
            {/* Category Header */}
            <Link
                href={`/category/${category.slug}`}
                className="mb-3 flex flex-wrap justify-between items-center"
            >
                <h3 className="text-base font-semibold text-black mb-1">
                    {category.name}
                </h3>
                <span className="text-xs text-secondary hover:underline">
                    View all →
                </span>
            </Link>

            {/* Subcategories */}
            {category.sub_categories.length > 0 ? (
                <div className="grid xxs:grid-cols-3 grid-cols-2 gap-2">
                    {category.sub_categories.map((subCategory) => (
                        <Link
                            key={subCategory.slug}
                            href={`/category/${subCategory.slug}`}
                            className="flex flex-col items-center group"
                        >
                            <div className="w-16 h-16 mb-1.5 overflow-hidden rounded-full bg-surface">
                                <img
                                    src={getCdnUrl(subCategory.image)}
                                    alt={subCategory.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>
                            <span className="text-xs text-center text-secondary group-hover:text-black transition-colors duration-200">
                                {subCategory.name}
                            </span>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-sm text-secondary italic">
                    No subcategories available
                </div>
            )}
        </div>
    );
};

export default NavCategoriesMobile;
