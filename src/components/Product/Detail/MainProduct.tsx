'use client';

import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductType } from '@/type/ProductType';
import Product from '../Product';
import Rate from '@/components/Other/Rate';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Scrollbar } from 'swiper/modules';
import 'swiper/css/bundle';
import * as Icon from "@phosphor-icons/react/dist/ssr";
import SwiperCore from 'swiper/core';
import { useCart } from '@/context/CartContext';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useCompare } from '@/context/CompareContext';
import { useModalCompareContext } from '@/context/ModalCompareContext';
import ModalSizeguide from '@/components/Modal/ModalSizeguide';
import { countdownTime } from '@/store/countdownTime';
import PricingTiersHorizontal from './PricingTiersHorizontal';
import { useProduct } from '@/hooks/queries/useProduct';
import RelatedProducts from '../RelatedProducts';
import { getCdnUrl } from '@/libs/cdn-url';
import Color from 'color';
import { useGuestCart } from '@/hooks/useGuestCart';


interface Props {
    slug: string;
}

const Sale: React.FC<Props> = ({ slug }) => {
    SwiperCore.use([Navigation, Thumbs]);

    // Fetch product data using React Query
    const { data: productMain, isLoading, error } = useProduct({ slug });

    const swiperRef: any = useRef(undefined);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [openPopupImg, setOpenPopupImg] = useState(false);
    const [openSizeGuide, setOpenSizeGuide] = useState<boolean>(false);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<string | undefined>('description');
    const [quantity, setQuantity] = useState<number>(1);
    const { addToCart, updateCart, cartState } = useCart();
    const { openModalCart } = useModalCartContext();
    const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist();
    const { openModalWishlist } = useModalWishlistContext();
    const { addToCompare, removeFromCompare, compareState } = useCompare();
    const { openModalCompare } = useModalCompareContext();

    // Modern cart management - ALWAYS use localStorage for current session
    const { addItem: addToLocalCart } = useGuestCart();

    const [timeLeft, setTimeLeft] = useState(countdownTime());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(countdownTime());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Process attributes similar to Product.tsx
    const attributes = useMemo(() => {
        return productMain?.attributes || [];
    }, [productMain]);

    // Extract colors with Color package processing
    const colors = useMemo(() => {
        const colorAttr = attributes.find(
            (a) => a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colours'
        );
        if (!colorAttr) return [] as { label: string, hex: string, value: string; }[];

        return colorAttr.children.map((child) => {
            let hex = child.name;

            try {
                // Try to parse the color and create a lighter version
                const originalColor = Color(child.name.toLowerCase());
                hex = originalColor.mix(Color('#ffffff'), 0.15).hex(); // Lighten by 15%
            } catch {
                // If color parsing fails, use colorCode if available or default light gray
                hex = (child as any).colorCode || '#E5E5E5';
            }

            return { label: child.name, hex, value: child.name };
        });
    }, [attributes]);

    // Extract non-color attributes for rendering
    const otherAttributes = useMemo(() => {
        return attributes.filter(
            (a) => a.name.toLowerCase() !== 'color' && a.name.toLowerCase() !== 'colours'
        );
    }, [attributes]);

    // Initialize selected attributes with first option of each attribute
    useEffect(() => {
        if (attributes.length > 0 && Object.keys(selectedAttributes).length === 0) {
            const initialSelection: Record<string, string> = {};
            attributes.forEach(attr => {
                if (attr.children.length > 0) {
                    initialSelection[attr.name] = attr.children[0].name;
                }
            });
            setSelectedAttributes(initialSelection);
        }
    }, [attributes, selectedAttributes]);

    // Handle loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
            </div>
        );
    }

    // Handle error state
    if (error || !productMain) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-600 text-xl mb-4">Failed to load product</p>
                <Link href="/shop" className="button-main">
                    Back to Shop
                </Link>
            </div>
        );
    }

    // Map API data to component expected format (temporary until full integration)
    const product = {
        ...productMain,
        id: productMain._id,
        images: productMain.description_images || [],
        originPrice: productMain.price, // Will be calculated with sales discount
        type: productMain.category?.name || '',
        rate: productMain.rating || 0,
        quantityPurchase: quantity,
        // Merge specifications and dimensions into one array
        specifications: [
            ...(productMain.specifications || []),
            ...(productMain.dimension?.map(({ key, value }) => ({ key, value })) || [])
        ],
        // For products without attributes, use dummy values
        sold: productMain.originStock - productMain.stock,
        quantity: productMain.stock,
    } as any;

    const percentSale = Math.floor(100 - ((product.price / product.originPrice) * 100));

    // Calculate current unit price and total price for display
    const effectiveBasePrice = (selectedAttributes['Color'] || selectedAttributes['Colour'])
        ? product.price * 1.1
        : product.price;
    const priceAfterSales = percentSale > 0
        ? effectiveBasePrice * (1 - percentSale / 100)
        : effectiveBasePrice;

    // Dummy pricing tiers - should come from product data in real implementation
    const pricingTiers = [
        { minQty: 1, maxQty: 9, strategy: 'fixedPrice' as const, value: 45.0 },
        { minQty: 10, maxQty: 49, strategy: 'percentOff' as const, value: 10 },
        { minQty: 50, maxQty: 99, strategy: 'percentOff' as const, value: 15 },
        { minQty: 100, maxQty: 199, strategy: 'percentOff' as const, value: 20 },
        { minQty: 200, maxQty: 499, strategy: 'amountOff' as const, value: 10.0 },
        { minQty: 500, maxQty: undefined, strategy: 'amountOff' as const, value: 15.0 },
    ];

    const getCurrentTier = (qty: number) => {
        for (let i = 0; i < pricingTiers.length; i++) {
            const tier = pricingTiers[i];
            if (qty >= tier.minQty && (tier.maxQty === undefined || qty <= tier.maxQty)) {
                return tier;
            }
        }
        return null;
    };

    const calculateTierPrice = (tier: typeof pricingTiers[0]): number => {
        switch (tier.strategy) {
            case 'fixedPrice':
                return tier.value;
            case 'percentOff':
                return priceAfterSales * (1 - tier.value / 100);
            case 'amountOff':
                return priceAfterSales - tier.value;
            default:
                return priceAfterSales;
        }
    };

    const currentTier = getCurrentTier(quantity);
    const currentUnitPrice = currentTier ? calculateTierPrice(currentTier) : priceAfterSales;
    const totalPrice = currentUnitPrice * quantity;

    const handleOpenSizeGuide = () => {
        setOpenSizeGuide(true);
    };

    const handleCloseSizeGuide = () => {
        setOpenSizeGuide(false);
    };

    const handleSwiper = (swiper: SwiperCore) => {
        // Do something with the thumbsSwiper instance
        setThumbsSwiper(swiper);
    };

    const handleAttributeChange = (attributeName: string, value: string) => {
        setSelectedAttributes(prev => ({
            ...prev,
            [attributeName]: value
        }));
    };

    const handleIncreaseQuantity = () => {
        const newQty = quantity + 1;
        setQuantity(newQty);
        product.quantityPurchase = newQty;
        const color = selectedAttributes['Color'] || selectedAttributes['Colour'] || '';
        const size = selectedAttributes['Size'] || '';
        updateCart(product.id, newQty, size, color);
    };

    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            const newQty = quantity - 1;
            setQuantity(newQty);
            product.quantityPurchase = newQty;
            const color = selectedAttributes['Color'] || selectedAttributes['Colour'] || '';
            const size = selectedAttributes['Size'] || '';
            updateCart(product.id, newQty, size, color);
        }
    };

    const handleQuantityChange = (value: string) => {
        const numValue = parseInt(value) || 0;
        const validQty = numValue <= 0 ? 1 : numValue;
        setQuantity(validQty);
        product.quantityPurchase = validQty;
        const color = selectedAttributes['Color'] || selectedAttributes['Colour'] || '';
        const size = selectedAttributes['Size'] || '';
        updateCart(product.id, validQty, size, color);
    };

    const handleTierClick = (minQty: number) => {
        setQuantity(minQty);
        product.quantityPurchase = minQty;
        const color = selectedAttributes['Color'] || selectedAttributes['Colour'] || '';
        const size = selectedAttributes['Size'] || '';
        updateCart(product.id, minQty, size, color);
    };

    const handleAddToCart = () => {
        // Build attributes array from selected attributes
        const attributes: Array<{ name: string; value: string; }> = [];

        // Add all selected attributes to the array
        Object.entries(selectedAttributes).forEach(([name, value]) => {
            if (value) {
                attributes.push({ name, value });
            }
        });

        // ALWAYS use localStorage for current session (whether guest or authenticated)
        // Server cart is only for cross-device/session sync
        try {
            addToLocalCart(
                product._id || product.id,
                quantity,
                attributes,
                {
                    name: product.name,
                    price: currentUnitPrice, // Use calculated tier price
                    sku: product.sku || product.id,
                    image: product.images?.[0]?.url || '',
                },
                currentUnitPrice, // unitPrice with tier pricing applied
                product.sale?._id, // sale ID if active
                undefined // saleVariantIndex - would need to calculate from active variant
            );
            openModalCart();
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Failed to add item to cart. Please try again.');
        }
    };
    const handleAddToWishlist = () => {
        // if product existed in wishlit, remove from wishlist and set state to false
        if (wishlistState.wishlistArray.some(item => item.id === product.id)) {
            removeFromWishlist(product.id);
        } else {
            // else, add to wishlist and set state to true
            addToWishlist(product);
        }
        openModalWishlist();
    };

    const handleAddToCompare = () => {
        // if product existed in wishlit, remove from wishlist and set state to false
        if (compareState.compareArray.length < 3) {
            if (compareState.compareArray.some(item => item.id === product.id)) {
                removeFromCompare(product.id);
            } else {
                // else, add to wishlist and set state to true
                addToCompare(product);
            }
        } else {
            alert('Compare up to 3 products');
        }

        openModalCompare();
    };

    const handleActiveTab = (tab: string) => {
        setActiveTab(tab);
    };

    return (
        <>
            <div className="product-detail sale">
                <div className="featured-product underwear py-10">
                    <div className="container flex justify-between gap-y-6 flex-wrap">
                        <div className="list-img md:w-1/2 md:pr-[45px] w-ful md:!sticky md:top-6
                         md:h-fit">
                            <Swiper
                                slidesPerView={1}
                                spaceBetween={0}
                                thumbs={{ swiper: thumbsSwiper }}
                                modules={[Thumbs]}
                                className="mySwiper2 rounded-2xl overflow-hidden"
                            >
                                {product.images.map((item: any, index: number) => (
                                    <SwiperSlide
                                        key={index}
                                        className='!w-full max-h-[75vh]'
                                        onClick={() => {
                                            swiperRef.current?.slideTo(index);
                                            setOpenPopupImg(true);
                                        }}
                                    >
                                        <Image
                                            src={getCdnUrl(item.url)}
                                            width={1000}
                                            height={1000}
                                            alt='prd-img'
                                            className='w-full aspect-[3/4] object-cover'
                                        />
                                    </SwiperSlide>
                                )
                                )}
                            </Swiper>
                            <Swiper
                                onSwiper={handleSwiper}
                                spaceBetween={0}
                                slidesPerView={4}
                                freeMode={true}
                                watchSlidesProgress={true}
                                modules={[Navigation, Thumbs]}
                                className="mySwiper style-rectangle"
                            >
                                {product.images.map((item: any, index: number) => (
                                    <SwiperSlide key={index}>
                                        <Image
                                            src={getCdnUrl(item.url)}
                                            width={1000}
                                            height={1300}
                                            alt='prd-img'
                                            className='w-full aspect-[3/4] object-cover rounded-xl'
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            <div className={`popup-img ${openPopupImg ? 'open' : ''}`}>
                                <span
                                    className="close-popup-btn absolute top-4 right-4 z-[2] cursor-pointer"
                                    onClick={() => {
                                        setOpenPopupImg(false);
                                    }}
                                >
                                    <Icon.X className="text-3xl text-white" />
                                </span>
                                <Swiper
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    modules={[Navigation, Thumbs]}
                                    navigation={true}
                                    loop={true}
                                    className="popupSwiper"
                                    onSwiper={(swiper) => {
                                        swiperRef.current = swiper;
                                    }}
                                >
                                    {product.images.map((item: any, index: number) => (
                                        <SwiperSlide
                                            key={index}
                                            onClick={() => {
                                                setOpenPopupImg(false);
                                            }}
                                        >
                                            <Image
                                                src={getCdnUrl(item.url)}
                                                width={1000}
                                                height={1000}
                                                alt='prd-img'
                                                className='w-full aspect-[3/4] object-cover rounded-xl'
                                                onClick={(e) => {
                                                    e.stopPropagation(); // prevent
                                                }}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                        <div className="product-infor md:w-1/2 w-full lg:pl-[15px] md:pl-2">
                            <div className="flex justify-between">
                                <div>
                                    <div className="caption2 text-secondary font-semibold uppercase">{product.type}</div>
                                    <div className="heading4 mt-1">{product.name}</div>
                                </div>
                                <div
                                    className={`add-wishlist-btn w-12 h-12 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white ${wishlistState.wishlistArray.some(item => item.id === product.id) ? 'active' : ''}`}
                                    onClick={handleAddToWishlist}
                                >
                                    {wishlistState.wishlistArray.some(item => item.id === product.id) ? (
                                        <>
                                            <Icon.Heart size={24} weight='fill' className='text-white' />
                                        </>
                                    ) : (
                                        <>
                                            <Icon.Heart size={24} />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center mt-3">
                                <Rate currentRate={product.rate} size={14} />
                                <span className='caption1 text-secondary'>(1.234 reviews)</span>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap mt-5 pb-6 border-b border-line">
                                <div className="product-price heading5">${product.price}.00</div>
                                <div className='w-px h-4 bg-line'></div>
                                <div className="product-origin-price font-normal text-secondary2"><del>${product.originPrice}.00</del></div>
                                {product.originPrice && (
                                    <div className="product-sale caption2 font-semibold bg-green px-3 py-0.5 inline-block rounded-full">
                                        -{percentSale}%
                                    </div>
                                )}
                                <div className='desc text-secondary mt-3'>{product.description}</div>
                            </div>
                            <div className="list-action mt-6 gap-4 flex-col">
                                <div className="countdown-block flex items-center flex-wrap gap-4 md:gap-8">
                                    <div className="text-title">Hurry Up!<br />
                                        Offer ends in:</div>
                                    <div className="countdown-time flex items-center lg:gap-5 gap-3 max-[400px]:justify-between max-[400px]:w-full">
                                        <div className="item w-[60px] h-[60px] flex flex-col items-center justify-center border border-red rounded-lg">
                                            <div className="days heading6 text-center">{timeLeft.days < 10 ? `0${timeLeft.days}` : timeLeft.days}</div>
                                            <div className="caption1 text-center">Days</div>
                                        </div>
                                        <div className="heading5">:</div>
                                        <div className="item w-[60px] h-[60px] flex flex-col items-center justify-center border border-red rounded-lg">
                                            <div className="hours heading6 text-center">{timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours}</div>
                                            <div className="caption1 text-center">Hours</div>
                                        </div>
                                        <div className="heading5">:</div>
                                        <div className="item w-[60px] h-[60px] flex flex-col items-center justify-center border border-red rounded-lg">
                                            <div className="mins heading6 text-center">{timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}</div>
                                            <div className="caption1 text-center">Mins</div>
                                        </div>
                                        <div className="heading5">:</div>
                                        <div className="item w-[60px] h-[60px] flex flex-col items-center justify-center border border-red rounded-lg">
                                            <div className="secs heading6 text-center">{timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}</div>
                                            <div className="caption1 text-center">Secs</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="sold flex flex-wrap gap-4 md:gap-20 mt-10">
                                    <div className="text-title">sold It:</div>
                                    <div className="right w-3/4">
                                        <div className="progress h-2 rounded-full overflow-hidden bg-line relative">
                                            <div
                                                className={`percent-sold absolute top-0 left-0 h-full bg-red`}
                                                style={{ width: `${Math.floor((product.sold / product.quantity) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2">
                                            <span>{Math.floor((product.sold / product.quantity) * 100)}% Sold -</span>
                                            <span className='text-secondary'>Only {Math.floor(product.quantity - product.sold)} item(s) left in stock!</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Color Attribute - Rendered with Color package */}
                                {colors.length > 0 && (
                                    <div className="choose-color mt-5">
                                        <div className="text-title">
                                            Colors: <span className='text-title color'>{selectedAttributes['Color'] || selectedAttributes['Colour'] || ''}</span>
                                        </div>
                                        <div className="list-color flex items-center gap-2 flex-wrap mt-3">
                                            {colors.map((item, index) => (
                                                <div
                                                    className={`color-item w-12 h-12 rounded-xl duration-300 relative cursor-pointer ${(selectedAttributes['Color'] === item.label || selectedAttributes['Colour'] === item.label) ? 'active' : ''
                                                        }`}
                                                    key={index}
                                                    style={{ backgroundColor: item.hex }}
                                                    onClick={() => handleAttributeChange(
                                                        attributes.find(a => a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colours')?.name || 'Color',
                                                        item.label
                                                    )}
                                                >
                                                    <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                                                        {item.label}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Other Attributes - Rendered as plain text */}
                                {otherAttributes.map((attr, attrIndex) => (
                                    <div key={attrIndex} className="choose-attribute mt-5">
                                        <div className="text-title">
                                            {attr.name}: <span className='text-title'>{selectedAttributes[attr.name] || ''}</span>
                                        </div>
                                        <div className="list-options flex items-center gap-2 flex-wrap mt-3">
                                            {attr.children.map((option, optIndex) => (
                                                <div
                                                    className={`option-item px-4 py-2 flex items-center justify-center text-button rounded-lg bg-white border border-line cursor-pointer duration-300 hover:bg-black hover:text-white ${selectedAttributes[attr.name] === option.name ? 'active bg-black text-white' : ''
                                                        }`}
                                                    key={optIndex}
                                                    onClick={() => handleAttributeChange(attr.name, option.name)}
                                                >
                                                    {option.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Wholesale Pricing Tiers */}
                                <PricingTiersHorizontal
                                    basePrice={product.price}
                                    salesDiscount={percentSale}
                                    attributePrice={(selectedAttributes['Color'] || selectedAttributes['Colour']) ? product.price * 1.1 : undefined}
                                    currentQuantity={quantity}
                                    onTierClick={handleTierClick}
                                />


                                <div className="text-title mt-5">Quantity:</div>

                                {/* Total Price Display */}
                                <div className="mt-4 p-4 bg-surface rounded-lg border border-line">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-secondary2 text-sm">Total Price</div>
                                            <div className="text-xs text-secondary2 mt-0.5">
                                                {quantity} × ${currentUnitPrice.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="heading5 text-black">${totalPrice.toFixed(2)}</div>
                                            {quantity > 1 && (
                                                <div className="text-xs text-secondary2 mt-0.5">
                                                    ${currentUnitPrice.toFixed(2)} per unit
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="choose-quantity flex items-center lg:justify-between gap-5 gap-y-3 mt-3">
                                    <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                                        <Icon.Minus
                                            size={20}
                                            onClick={handleDecreaseQuantity}
                                            className={`${quantity === 1 ? 'disabled' : ''} cursor-pointer`}
                                        />
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(e.target.value)}
                                            className="body1 font-semibold w-16 text-center bg-transparent border-none outline-none"
                                            min="1"
                                        />
                                        <Icon.Plus
                                            size={20}
                                            onClick={handleIncreaseQuantity}
                                            className='cursor-pointer'
                                        />
                                    </div>
                                    <div onClick={handleAddToCart} className="button-main w-full text-center bg-white text-black border border-black">Add To Cart</div>
                                </div>


                                <div className="flex items-center lg:gap-20 gap-8 mt-5 pb-6 border-b border-line">
                                    <div className="compare flex items-center gap-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleAddToCompare(); }}>
                                        <div className="compare-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white">
                                            <Icon.ArrowsCounterClockwise className='heading6' />
                                        </div>
                                        <span>Compare</span>
                                    </div>
                                    <div className="share flex items-center gap-3 cursor-pointer">
                                        <div className="share-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white">
                                            <Icon.ShareNetwork weight='fill' className='heading6' />
                                        </div>
                                        <span>Share Products</span>
                                    </div>
                                </div><div className="more-infor mt-6">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-1">
                                            <Icon.ArrowClockwise className='body1' />
                                            <div className="text-title">Delivery & Return</div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Icon.Question className='body1' />
                                            <div className="text-title">Ask A Question</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-3">
                                        <Icon.Eye className='body1' />
                                        <div className="text-title">38</div>
                                        <div className="text-secondary">people viewing this product right now!</div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-3">
                                        <div className="text-title">SKU:</div>
                                        <div className="text-secondary">{product.sku || 'N/A'}</div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-3">
                                        <div className="text-title">Categories:</div>
                                        <div className="text-secondary">{typeof product.category === 'string' ? product.category : product.category?.name || 'N/A'}</div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-3">
                                        <div className="text-title">Tag:</div>
                                        <div className="text-secondary">{product.type}</div>
                                    </div>
                                </div>
                                <div className="list-payment mt-7">
                                    <div className="main-content lg:pt-8 pt-6 lg:pb-6 pb-4 sm:px-4 px-3 border border-line rounded-xl relative max-md:w-2/3 max-sm:w-full">
                                        <div className="heading6 px-5 bg-white absolute -top-[14px] left-1/2 -translate-x-1/2 whitespace-nowrap">Guranteed safe checkout</div>
                                        <div className="list grid grid-cols-6">
                                            <div className="item flex items-center justify-center lg:px-3 px-1">
                                                <Image
                                                    src={'/images/payment/Frame-0.png'}
                                                    width={500}
                                                    height={450}
                                                    alt='payment'
                                                    className='w-full'
                                                />
                                            </div>
                                            <div className="item flex items-center justify-center lg:px-3 px-1">
                                                <Image
                                                    src={'/images/payment/Frame-1.png'}
                                                    width={500}
                                                    height={450}
                                                    alt='payment'
                                                    className='w-full'
                                                />
                                            </div>
                                            <div className="item flex items-center justify-center lg:px-3 px-1">
                                                <Image
                                                    src={'/images/payment/Frame-2.png'}
                                                    width={500}
                                                    height={450}
                                                    alt='payment'
                                                    className='w-full'
                                                />
                                            </div>
                                            <div className="item flex items-center justify-center lg:px-3 px-1">
                                                <Image
                                                    src={'/images/payment/Frame-3.png'}
                                                    width={500}
                                                    height={450}
                                                    alt='payment'
                                                    className='w-full'
                                                />
                                            </div>
                                            <div className="item flex items-center justify-center lg:px-3 px-1">
                                                <Image
                                                    src={'/images/payment/Frame-4.png'}
                                                    width={500}
                                                    height={450}
                                                    alt='payment'
                                                    className='w-full'
                                                />
                                            </div>
                                            <div className="item flex items-center justify-center lg:px-3 px-1">
                                                <Image
                                                    src={'/images/payment/Frame-5.png'}
                                                    width={500}
                                                    height={450}
                                                    alt='payment'
                                                    className='w-full'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="get-it mt-6">
                                <div className="heading5">Get it today</div>
                                <div className="item flex items-center gap-3 mt-4">
                                    <div className="icon-delivery-truck text-4xl"></div>
                                    <div>
                                        <div className="text-title">Free shipping</div>
                                        <div className="caption1 text-secondary mt-1">Free shipping on orders over $400,000.</div>
                                    </div>
                                </div>
                                <div className="item flex items-center gap-3 mt-4">
                                    <div className="icon-phone-call text-4xl"></div>
                                    <div>
                                        <div className="text-title">Support everyday</div>
                                        <div className="caption1 text-secondary mt-1">Support from 9:00 AM to 9:00 PM everyday</div>
                                    </div>
                                </div>
                                <div className="item flex items-center gap-3 mt-4">
                                    <div className="icon-return text-4xl"></div>
                                    <div>
                                        <div className="text-title">2 Day Returns</div>
                                        <div className="caption1 text-secondary mt-1">Not impressed? Get a refund. You have 2 days to break our hearts.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className='w-full my-8 opacity-30' />
                <div className="desc-tab">
                    <div className="container">
                        <div className="flex items-center justify-center w-full">
                            <div className="menu-tab flex items-center md:gap-[60px] gap-8">
                                <div
                                    className={`tab-item heading5 has-line-before text-secondary2 hover:text-black duration-300 ${activeTab === 'description' ? 'active' : ''}`}
                                    onClick={() => handleActiveTab('description')}
                                >
                                    Description
                                </div>
                                <div
                                    className={`tab-item heading5 has-line-before text-secondary2 hover:text-black duration-300 ${activeTab === 'specifications' ? 'active' : ''}`}
                                    onClick={() => handleActiveTab('specifications')}
                                >
                                    Specifications
                                </div>
                                <div
                                    className={`tab-item heading5 has-line-before text-secondary2 hover:text-black duration-300 ${activeTab === 'review' ? 'active' : ''}`}
                                    onClick={() => handleActiveTab('review')}
                                >
                                    Review
                                </div>
                            </div>
                        </div>
                        <div className="desc-block mt-8">
                            <div className={`desc-item description ${activeTab === 'description' ? 'open' : ''}`}>
                                <div className='grid md:grid-cols-2 gap-8 gap-y-5'>
                                    <div className="left">
                                        <div className="heading6">Description</div>
                                        <div className="text-secondary mt-2">Keep your home organized, yet elegant with storage cabinets by Onita Patio Furniture. These cabinets not only make a great storage units, but also bring a great decorative accent to your decor. Traditionally designed, they are perfect to be used in the hallway, living room, bedroom, office or any place where you need to store or display things. Made of high quality materials, they are sturdy and durable for years. Bring one-of-a-kind look to your interior with furniture from Onita Furniture!</div>
                                    </div>
                                    <div className="right">
                                        <div className="heading6">About This Products</div>
                                        <div className="list-feature">
                                            <div className="item flex gap-1 text-secondary mt-1">
                                                <Icon.Dot size={28} />
                                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                            </div>
                                            <div className="item flex gap-1 text-secondary mt-1">
                                                <Icon.Dot size={28} />
                                                <p>Nulla luctus libero quis mauris vestibulum dapibus.</p>
                                            </div>
                                            <div className="item flex gap-1 text-secondary mt-1">
                                                <Icon.Dot size={28} />
                                                <p>Maecenas ullamcorper erat mi, vel consequat enim suscipit at.</p>
                                            </div>
                                            <div className="item flex gap-1 text-secondary mt-1">
                                                <Icon.Dot size={28} />
                                                <p>Quisque consectetur nibh ac urna molestie scelerisque.</p>
                                            </div>
                                            <div className="item flex gap-1 text-secondary mt-1">
                                                <Icon.Dot size={28} />
                                                <p>Mauris in nisl scelerisque massa consectetur pretium sed et mauris.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`desc-item specifications flex items-center justify-center ${activeTab === 'specifications' ? 'open' : ''}`}>
                                <div className='lg:w-1/2 sm:w-3/4 w-full'>
                                    {product.specifications && product.specifications.length > 0 ? (
                                        product.specifications.map((spec: any, index: number) => (
                                            <div
                                                key={index}
                                                className={`item flex items-center gap-8 py-3 px-10 ${index % 2 === 0 ? 'bg-surface' : ''}`}
                                            >
                                                <div className="text-title sm:w-1/4 w-1/3 capitalize">{spec.key}</div>
                                                <p>{spec.value}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-secondary py-8">
                                            No specifications available for this product.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`desc-item review-block ${activeTab === 'review' ? 'open' : ''}`}>
                                <div className="top-overview flex max-sm:flex-col items-center justify-between gap-12 gap-y-4">
                                    <div className="left flex max-sm:flex-col gap-y-4 items-center justify-between lg:w-1/2 sm:w-2/3 w-full sm:pr-5">
                                        <div className='rating black-start flex flex-col items-center'>
                                            <div className="text-display">4.6</div>
                                            <Rate currentRate={5} size={18} />
                                            <div className='text-center whitespace-nowrap mt-1'>(1,968 Ratings)</div>
                                        </div>
                                        <div className="list-rating w-2/3">
                                            <div className="item flex items-center justify-end gap-1.5">
                                                <div className="flex items-center gap-1">
                                                    <div className="caption1">5</div>
                                                    <Icon.Star size={14} weight='fill' />
                                                </div>
                                                <div className="progress bg-line relative w-3/4 h-2">
                                                    <div className="progress-percent absolute bg-black w-[50%] h-full left-0 top-0"></div>
                                                </div>
                                                <div className="caption1">50%</div>
                                            </div>
                                            <div className="item flex items-center justify-end gap-1.5 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <div className="caption1">4</div>
                                                    <Icon.Star size={14} weight='fill' />
                                                </div>
                                                <div className="progress bg-line relative w-3/4 h-2">
                                                    <div className="progress-percent absolute bg-black w-[20%] h-full left-0 top-0"></div>
                                                </div>
                                                <div className="caption1">20%</div>
                                            </div>
                                            <div className="item flex items-center justify-end gap-1.5 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <div className="caption1">3</div>
                                                    <Icon.Star size={14} weight='fill' />
                                                </div>
                                                <div className="progress bg-line relative w-3/4 h-2">
                                                    <div className="progress-percent absolute bg-black w-[10%] h-full left-0 top-0"></div>
                                                </div>
                                                <div className="caption1">10%</div>
                                            </div>
                                            <div className="item flex items-center justify-end gap-1.5 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <div className="caption1">2</div>
                                                    <Icon.Star size={14} weight='fill' />
                                                </div>
                                                <div className="progress bg-line relative w-3/4 h-2">
                                                    <div className="progress-percent absolute bg-black w-[10%] h-full left-0 top-0"></div>
                                                </div>
                                                <div className="caption1">10%</div>
                                            </div>
                                            <div className="item flex items-center justify-end gap-1.5 mt-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="caption1">1</div>
                                                    <Icon.Star size={14} weight='fill' />
                                                </div>
                                                <div className="progress bg-line relative w-3/4 h-2">
                                                    <div className="progress-percent absolute bg-black w-[10%] h-full left-0 top-0"></div>
                                                </div>
                                                <div className="caption1">10%</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="right">
                                        <Link href={'#form-review'} className='button-main bg-white text-black border border-black whitespace-nowrap'>Write Reviews</Link>
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <div className="heading flex items-center justify-between flex-wrap gap-4">
                                        <div className="heading4">03 Comments</div>
                                        <div className="right flex items-center gap-3">
                                            <label htmlFor='select-filter' className="uppercase">Sort by:</label>
                                            <div className="select-block relative">
                                                <select
                                                    id="select-filter"
                                                    name="select-filter"
                                                    className='text-button py-2 pl-3 md:pr-14 pr-10 rounded-lg bg-white border border-line'
                                                    defaultValue={'Sorting'}
                                                >
                                                    <option value="Sorting" disabled>Sorting</option>
                                                    <option value="newest">Newest</option>
                                                    <option value="5star">5 Star</option>
                                                    <option value="4star">4 Star</option>
                                                    <option value="3star">3 Star</option>
                                                    <option value="2star">2 Star</option>
                                                    <option value="1star">1 Star</option>
                                                </select>
                                                <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-4 right-2' />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="list-review mt-6">
                                        <div className="item">
                                            <div className="heading flex items-center justify-between">
                                                <div className="user-infor flex gap-4">
                                                    <div className="avatar">
                                                        <Image
                                                            src={'/images/avatar/1.png'}
                                                            width={200}
                                                            height={200}
                                                            alt='img'
                                                            className='w-[52px] aspect-square rounded-full'
                                                        />
                                                    </div>
                                                    <div className="user">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-title">Tony Nguyen</div>
                                                            <div className="span text-line">-</div>
                                                            <Rate currentRate={5} size={12} />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-secondary2">1 days ago</div>
                                                            <div className="text-secondary2">-</div>
                                                            <div className="text-secondary2"><span>Yellow</span> / <span>XL</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="more-action cursor-pointer">
                                                    <Icon.DotsThree size={24} weight='bold' />
                                                </div>
                                            </div>
                                            <div className="mt-3">I can{String.raw`'t`} get enough of the fashion pieces from this brand. They have a great selection for every occasion and the prices are reasonable. The shipping is fast and the items always arrive in perfect condition.</div>
                                            <div className="action mt-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="like-btn flex items-center gap-1 cursor-pointer">
                                                        <Icon.HandsClapping size={18} />
                                                        <div className="text-button">20</div>
                                                    </div>
                                                    <Link href={'#form-review'} className="reply-btn text-button text-secondary cursor-pointer hover:text-black">Reply</Link>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item mt-8">
                                            <div className="heading flex items-center justify-between">
                                                <div className="user-infor flex gap-4">
                                                    <div className="avatar">
                                                        <Image
                                                            src={'/images/avatar/2.png'}
                                                            width={200}
                                                            height={200}
                                                            alt='img'
                                                            className='w-[52px] aspect-square rounded-full'
                                                        />
                                                    </div>
                                                    <div className="user">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-title">Guy Hawkins</div>
                                                            <div className="span text-line">-</div>
                                                            <Rate currentRate={4} size={12} />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-secondary2">1 days ago</div>
                                                            <div className="text-secondary2">-</div>
                                                            <div className="text-secondary2"><span>Yellow</span> / <span>XL</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="more-action cursor-pointer">
                                                    <Icon.DotsThree size={24} weight='bold' />
                                                </div>
                                            </div>
                                            <div className="mt-3">I can{String.raw`'t`} get enough of the fashion pieces from this brand. They have a great selection for every occasion and the prices are reasonable. The shipping is fast and the items always arrive in perfect condition.</div>
                                            <div className="action mt-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="like-btn flex items-center gap-1 cursor-pointer">
                                                        <Icon.HandsClapping size={18} />
                                                        <div className="text-button">20</div>
                                                    </div>
                                                    <Link href={'#form-review'} className="reply-btn text-button text-secondary cursor-pointer hover:text-black">Reply</Link>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item mt-8">
                                            <div className="heading flex items-center justify-between">
                                                <div className="user-infor flex gap-4">
                                                    <div className="avatar">
                                                        <Image
                                                            src={'/images/avatar/3.png'}
                                                            width={200}
                                                            height={200}
                                                            alt='img'
                                                            className='w-[52px] aspect-square rounded-full'
                                                        />
                                                    </div>
                                                    <div className="user">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-title">John Smith</div>
                                                            <div className="span text-line">-</div>
                                                            <Rate currentRate={5} size={12} />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-secondary2">1 days ago</div>
                                                            <div className="text-secondary2">-</div>
                                                            <div className="text-secondary2"><span>Yellow</span> / <span>XL</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="more-action cursor-pointer">
                                                    <Icon.DotsThree size={24} weight='bold' />
                                                </div>
                                            </div>
                                            <div className="mt-3">I can{String.raw`'t`} get enough of the fashion pieces from this brand. They have a great selection for every occasion and the prices are reasonable. The shipping is fast and the items always arrive in perfect condition.</div>
                                            <div className="action mt-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="like-btn flex items-center gap-1 cursor-pointer">
                                                        <Icon.HandsClapping size={18} />
                                                        <div className="text-button">20</div>
                                                    </div>
                                                    <Link href={'#form-review'} className="reply-btn text-button text-secondary cursor-pointer hover:text-black">Reply</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="form-review" className='form-review pt-6'>
                                        <div className="heading4">Leave A comment</div>
                                        <form className="grid sm:grid-cols-2 gap-4 gap-y-5 md:mt-6 mt-3">
                                            <div className="name ">
                                                <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="username" type="text" placeholder="Your Name *" required />
                                            </div>
                                            <div className="mail ">
                                                <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="email" type="email" placeholder="Your Email *" required />
                                            </div>
                                            <div className="col-span-full message">
                                                <textarea className="border border-line px-4 py-3 w-full rounded-lg" id="message" name="message" placeholder="Your message *" required ></textarea>
                                            </div>
                                            <div className="col-span-full flex items-start -mt-2 gap-2">
                                                <input type="checkbox" id="saveAccount" name="saveAccount" className='mt-1.5' />
                                                <label className="" htmlFor="saveAccount">Save my name, email, and website in this browser for the next time I comment.</label>
                                            </div>
                                            <div className="col-span-full sm:pt-3">
                                                <button className='button-main bg-white text-black border border-black'>Submit Reviews</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <RelatedProducts productId={product.id} limit={4} />
            </div >
        </>
    );
};

export default Sale;