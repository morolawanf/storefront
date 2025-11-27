'use client'

import React, { useState } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEight from '@/components/Header/Menu/MenuEight'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import productData from '@/data/Product.json'
import ShopCollection from '@/components/Shop/ShopCollection'
import Footer from '@/components/Footer/Footer'

export default function Collection() {

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuEight props="bg-transparent" />
                <Breadcrumb heading='Shop Collection' subHeading='Collection' />
            </div>
            <ShopCollection data={productData} />
            <Footer />
        </>
    )
}
