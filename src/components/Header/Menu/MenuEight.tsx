'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { usePathname } from 'next/navigation';
import Product from '@/components/Product/Product';
import productData from '@/data/Product.json'
import useLoginPopup from '@/store/useLoginPopup';
import useSubMenuDepartment from '@/store/useSubMenuDepartment';
import useMenuMobile from '@/store/useMenuMobile';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useModalSearchContext } from '@/context/ModalSearchContext';
import { useCart } from '@/context/CartContext';
import NavCategoriesComponent from './NavCategoriesComponent';

// Data constants

const BLOG_LINKS = [
    { href: '/blog/default', label: 'Blog Default' },
    { href: '/blog/list', label: 'Blog List' },
    { href: '/blog/grid', label: 'Blog Grid' },
    { href: '/blog/detail1', label: 'Blog Detail 1' },
    { href: '/blog/detail2', label: 'Blog Detail 2' }
];

const PAGES_LINKS = [
    { href: '/pages/about', label: 'About Us' },
    { href: '/pages/contact', label: 'Contact Us' },
    { href: '/pages/store-list', label: 'Store List' },
    { href: '/pages/page-not-found', label: '404' },
    { href: '/pages/faqs', label: 'FAQs' },
    { href: '/pages/coming-soon', label: 'Coming Soon' },
    { href: '/pages/customer-feedbacks', label: 'Customer Feedbacks' }
];

const DEMO_LINKS = [
    [
        { href: '/', label: 'Home Fashion 1' },
        { href: '/homepages/fashion2', label: 'Home Fashion 2' },
        { href: '/homepages/fashion3', label: 'Home Fashion 3' },
        { href: '/homepages/fashion4', label: 'Home Fashion 4' },
        { href: '/homepages/fashion5', label: 'Home Fashion 5' },
        { href: '/homepages/fashion6', label: 'Home Fashion 6' }
    ],
    [
        { href: '/homepages/fashion7', label: 'Home Fashion 7' },
        { href: '/homepages/fashion8', label: 'Home Fashion 8' },
        { href: '/homepages/fashion9', label: 'Home Fashion 9' },
        { href: '/homepages/fashion10', label: 'Home Fashion 10' },
        { href: '/homepages/fashion11', label: 'Home Fashion 11' },
        { href: '/homepages/underwear', label: 'Home Underwear' }
    ],
    [
        { href: '/homepages/cosmetic1', label: 'Home Cosmetic 1' },
        { href: '/homepages/cosmetic2', label: 'Home Cosmetic 2' },
        { href: '/homepages/cosmetic3', label: 'Home Cosmetic 3' },
        { href: '/homepages/pet', label: 'Home Pet Store' },
        { href: '/homepages/jewelry', label: 'Home Jewelry' },
        { href: '/homepages/furniture', label: 'Home Furniture' }
    ],
    [
        { href: '/homepages/watch', label: 'Home Watch' },
        { href: '/homepages/toys', label: 'Home Toys Kid' },
        { href: '/homepages/yoga', label: 'Home Yoga' },
        { href: '/homepages/organic', label: 'Home Organic' },
        { href: '/homepages/marketplace', label: 'Home Marketplace' }
    ]
];

// Flatten demo links for mobile (2 columns)
const MOBILE_DEMO_LINKS_COL1 = [
    ...DEMO_LINKS[0],
    ...DEMO_LINKS[1].slice(0, 3)
];

const MOBILE_DEMO_LINKS_COL2 = [
    ...DEMO_LINKS[1].slice(3),
    ...DEMO_LINKS[2],
    ...DEMO_LINKS[3]
];

const MenuEight = () => {
    const pathname = usePathname()
    const { openLoginPopup, handleLoginPopup } = useLoginPopup()
    const { openSubMenuDepartment, handleSubMenuDepartment } = useSubMenuDepartment()
    const { openMenuMobile, handleMenuMobile } = useMenuMobile()
    const [openSubNavMobile, setOpenSubNavMobile] = useState<number | null>(null)
    const { openModalCart } = useModalCartContext()
    const { cartState } = useCart()
    const { openModalWishlist } = useModalWishlistContext()

    const [searchKeyword, setSearchKeyword] = useState('');
    const router = useRouter()

    const handleSearch = (value: string) => {
        router.push(`/search-result?query=${value}`)
        setSearchKeyword('')
    }

    const handleOpenSubNavMobile = (index: number) => {
        setOpenSubNavMobile(openSubNavMobile === index ? null : index)
    }

    const [fixedHeader, setFixedHeader] = useState(false)
    const [lastScrollPosition, setLastScrollPosition] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setFixedHeader(scrollPosition > 0 && scrollPosition < lastScrollPosition);
            setLastScrollPosition(scrollPosition);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollPosition]);

    const handleGenderClick = (gender: string) => {
        router.push(`/shop/breadcrumb1?gender=${gender}`);
    };

    const handleCategoryClick = (category: string) => {
        router.push(`/shop/breadcrumb1?category=${category}`);
    };

    const handleTypeClick = (type: string) => {
        router.push(`/shop/breadcrumb1?type=${type}`);
    };

    return (
        <>
            {/* Header Menu */}
            <div className={`header-menu style-eight ${fixedHeader ? ' fixed' : 'relative'} bg-white w-full md:h-[74px] h-[56px]`}>
                <div className="container mx-auto h-full">
                    <div className="header-main flex items-center justify-between h-full">
                        <div className="menu-mobile-icon lg:hidden flex items-center" onClick={handleMenuMobile}>
                            <i className="icon-category text-2xl"></i>
                        </div>
                        <Link href={'/'} className='flex items-center'>
                            <div className="heading4">OEPlast</div>
                        </Link>
                        <div className="form-search w-2/3 pl-8 flex items-center h-[44px] max-lg:hidden">
                            <div className="category-block relative h-full">
                                <div className="category-btn bg-black relative flex items-center gap-6 py-2 px-4 h-full rounded-l w-fit cursor-pointer">
                                    <div className="text-button text-white whitespace-nowrap">All Categories</div>
                                    <Icon.CaretDown color='#ffffff' />
                                </div>
                            </div>
                            <div className='w-full flex items-center h-full'>
                                <input
                                    type="text"
                                    className="search-input h-full px-4 w-full border border-line"
                                    placeholder="What are you looking for today?"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchKeyword)}
                                />
                                <button
                                    className="search-button button-main bg-black h-full flex items-center px-7 rounded-none rounded-r"
                                    onClick={() => handleSearch(searchKeyword)}
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                        <div className="right flex gap-12">
                            <div className="list-action flex items-center gap-4">
                                <div className="user-icon flex items-center justify-center cursor-pointer">
                                    <Icon.User size={24} color='black' onClick={handleLoginPopup} />
                                    <div
                                        className={`login-popup absolute top-[74px] w-[320px] p-7 rounded-xl bg-white box-shadow-sm 
                                            ${openLoginPopup ? 'open' : ''}`}
                                    >
                                        <Link href={'/login'} className="button-main w-full text-center">Login</Link>
                                        <div className="text-secondary text-center mt-3 pb-4">Don't have an account?
                                            <Link href={'/register'} className='text-black pl-1 hover:underline'>Register</Link>
                                        </div>
                                        <div className="bottom pt-4 border-t border-line"></div>
                                        <Link href={'#!'} className='body1 hover:underline'>Support</Link>
                                    </div>
                                </div>
                                <div className="max-md:hidden wishlist-icon flex items-center cursor-pointer" onClick={openModalWishlist}>
                                    <Icon.Heart size={24} color='black' />
                                </div>
                                <div className="cart-icon flex items-center relative cursor-pointer" onClick={openModalCart}>
                                    <Icon.Handbag size={24} color='black' />
                                    <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-black w-4 h-4 flex items-center justify-center rounded-full">{cartState.cartArray.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Nav Menu */}
            <div className="top-nav-menu relative bg-white border-t border-b border-line h-[44px] max-lg:hidden z-10">
                <div className="container h-full">
                    <div className="top-nav-menu-main flex items-center justify-between h-full relative">
                        <div className="left flex items-center h-full">

                                <NavCategoriesComponent isOpen={openSubMenuDepartment}  />
                            <div className="menu-main style-eight h-full pl-12 max-lg:hidden">
                                <ul className='flex items-center gap-8 h-full'>
                                    <li className='h-full relative'>
                                        <Link
                                            href="#!"
                                            className={`text-button-uppercase duration-300 h-full flex items-center justify-center gap-1 
                                            ${pathname.includes('/homepages/') ? 'active' : ''}`}
                                        >
                                            Demo
                                        </Link>
                                        <div className="sub-menu absolute py-3 px-5 -left-10 w-max grid grid-cols-4 gap-5 bg-white rounded-b-xl">
                                            {DEMO_LINKS.map((column, colIndex) => (
                                                <ul key={colIndex}>
                                                    {column.map((link, linkIndex) => (
                                                        <li key={linkIndex}>
                                                            <Link
                                                                href={link.href}
                                                                className={`text-secondary duration-300 ${pathname === link.href ? 'active' : ''}`}
                                                            >
                                                                {link.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ))}
                                        </div>
                                    </li>
                                    
                                    {/* Features, Shop, Product menus remain as they have complex nested structures */}
                                    <li className='h-full'>
                                        <Link href="#!" className='text-button-uppercase duration-300 h-full flex items-center justify-center'>
                                            Features
                                        </Link>
                                        {/* ... keep existing Features mega menu ... */}
                                    </li>
                                    
                                    <li className='h-full'>
                                        <Link href="#!" className='text-button-uppercase duration-300 h-full flex items-center justify-center'>
                                            Shop
                                        </Link>
                                        {/* ... keep existing Shop mega menu ... */}
                                    </li>
                                    
                                    <li className='h-full'>
                                        <Link href="#!" className='text-button-uppercase duration-300 h-full flex items-center justify-center'>
                                            Product
                                        </Link>
                                        {/* ... keep existing Product mega menu ... */}
                                    </li>
                                    
                                    <li className='h-full relative'>
                                        <Link href="#!" className='text-button-uppercase duration-300 h-full flex items-center justify-center'>
                                            Blog
                                        </Link>
                                        <div className="sub-menu py-3 px-5 -left-10 absolute bg-white rounded-b-xl">
                                            <ul className='w-full'>
                                                {BLOG_LINKS.map((link, index) => (
                                                    <li key={index}>
                                                        <Link
                                                            href={link.href}
                                                            className={`text-secondary duration-300 ${pathname === link.href ? 'active' : ''}`}
                                                        >
                                                            {link.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </li>
                                    
                                    <li className='h-full relative'>
                                        <Link
                                            href="#!"
                                            className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname.includes('/pages') ? 'active' : ''}`}
                                        >
                                            Pages
                                        </Link>
                                        <div className="sub-menu py-3 px-5 -left-10 absolute bg-white rounded-b-xl">
                                            <ul className='w-full'>
                                                {PAGES_LINKS.map((link, index) => (
                                                    <li key={index}>
                                                        <Link
                                                            href={link.href}
                                                            className={`text-secondary duration-300 ${pathname === link.href ? 'active' : ''}`}
                                                        >
                                                            {link.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="right flex items-center gap-1">
                            <div className="caption1">Hotline:</div>
                            <div className="text-button-uppercase">+01 1234 8888</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div id="menu-mobile" className={`${openMenuMobile ? 'open' : ''}`}>
                <div className="menu-container bg-white h-full">
                    <div className="container h-full">
                        <div className="menu-main h-full overflow-hidden">
                            <div className="heading py-2 relative flex items-center justify-center">
                                <div
                                    className="close-menu-mobile-btn absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface flex items-center justify-center"
                                    onClick={handleMenuMobile}
                                >
                                    <Icon.X size={14} />
                                </div>
                                <Link href={'/'} className='logo text-3xl font-semibold text-center'>OEPlast</Link>
                            </div>
                            <div className="form-search relative mt-2">
                                <Icon.MagnifyingGlass size={20} className='absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer' />
                                <input type="text" placeholder='What are you looking for?' className=' h-12 rounded-lg border border-line text-sm w-full pl-10 pr-4' />
                            </div>
                            <div className="list-nav mt-6">
                                <ul>
                                    {/* Demo Menu */}
                                    <li
                                        className={`${openSubNavMobile === 1 ? 'open' : ''}`}
                                        onClick={() => handleOpenSubNavMobile(1)}
                                    >
                                        <a href={'#!'} className={`text-xl font-semibold flex items-center justify-between`}>Demo
                                            <span className='text-right'>
                                                <Icon.CaretRight size={20} />
                                            </span>
                                        </a>
                                        <div className="sub-nav-mobile">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(1)}
                                            >
                                                <Icon.CaretLeft />
                                                Back
                                            </div>
                                            <div className="list-nav-item w-full grid grid-cols-2 pt-2 pb-6">
                                                <ul>
                                                    {MOBILE_DEMO_LINKS_COL1.map((link, index) => (
                                                        <li key={index}>
                                                            <Link
                                                                href={link.href}
                                                                className={`nav-item-mobile text-secondary duration-300 ${pathname === link.href ? 'active' : ''}`}
                                                            >
                                                                {link.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <ul>
                                                    {MOBILE_DEMO_LINKS_COL2.map((link, index) => (
                                                        <li key={index}>
                                                            <Link
                                                                href={link.href}
                                                                className={`nav-item-mobile text-secondary duration-300 ${pathname === link.href ? 'active' : ''}`}
                                                            >
                                                                {link.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                    
                                    {/* Features, Shop, Product mobile menus - keep existing complex structures */}
                                    
                                    {/* Blog Menu */}
                                    <li
                                        className={`${openSubNavMobile === 5 ? 'open' : ''}`}
                                        onClick={() => handleOpenSubNavMobile(5)}
                                    >
                                        <a href={'#!'} className='text-xl font-semibold flex items-center justify-between mt-5'>Blog
                                            <span className='text-right'>
                                                <Icon.CaretRight size={20} />
                                            </span>
                                        </a>
                                        <div className="sub-nav-mobile">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(5)}
                                            >
                                                <Icon.CaretLeft />
                                                Back
                                            </div>
                                            <div className="list-nav-item w-full pt-2 pb-6">
                                                <ul className='w-full'>
                                                    {BLOG_LINKS.map((link, index) => (
                                                        <li key={index}>
                                                            <Link
                                                                href={link.href}
                                                                className={`text-secondary duration-300 ${pathname === link.href ? 'active' : ''}`}
                                                            >
                                                                {link.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                    
                                    {/* Pages Menu */}
                                    <li
                                        className={`${openSubNavMobile === 6 ? 'open' : ''}`}
                                        onClick={() => handleOpenSubNavMobile(6)}
                                    >
                                        <a href={'#!'} className='text-xl font-semibold flex items-center justify-between mt-5'>Pages
                                            <span className='text-right'>
                                                <Icon.CaretRight size={20} />
                                            </span>
                                        </a>
                                        <div className="sub-nav-mobile">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(6)}
                                            >
                                                <Icon.CaretLeft />
                                                Back
                                            </div>
                                            <div className="list-nav-item w-full pt-2 pb-6">
                                                <ul className='w-full'>
                                                    {PAGES_LINKS.map((link, index) => (
                                                        <li key={index}>
                                                            <Link
                                                                href={link.href}
                                                                className={`text-secondary duration-300 ${pathname === link.href ? 'active' : ''}`}
                                                            >
                                                                {link.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MenuEight
