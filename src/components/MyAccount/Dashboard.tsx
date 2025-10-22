'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as Icon from '@phosphor-icons/react/dist/ssr';
import { useAccountStore } from '@/store/accountStore';

export default function Dashboard() {
  const { activeTab, setOpenDetail } = useAccountStore();

  if (activeTab !== 'dashboard') return null;

  return (
    <div className="tab text-content w-full">
      <div className="overview grid sm:grid-cols-3 gap-5">
        <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
          <div className="counter">
            <span className="tese">Awaiting Pickup</span>
            <h5 className="heading5 mt-1">4</h5>
          </div>
          <Icon.HourglassMedium className="text-4xl" />
        </div>
        <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
          <div className="counter">
            <span className="tese">Cancelled Orders</span>
            <h5 className="heading5 mt-1">12</h5>
          </div>
          <Icon.ReceiptX className="text-4xl" />
        </div>
        <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
          <div className="counter">
            <span className="tese">Total Orders</span>
            <h5 className="heading5 mt-1">200</h5>
          </div>
          <Icon.Package className="text-4xl" />
        </div>
      </div>
      <div className="recent_order pt-5 px-5 pb-2 mt-7 border border-line rounded-xl">
        <h6 className="heading6">Recent Orders</h6>
        <div className="list overflow-x-auto w-full mt-5">
          <table className="w-full max-[1400px]:w-[700px] max-md:w-[700px]">
            <thead className="border-b border-line">
              <tr>
                <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">
                  Order
                </th>
                <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">
                  Products
                </th>
                <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">
                  Pricing
                </th>
                <th scope="col" className="pb-3 text-right text-sm font-bold uppercase text-secondary whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="item duration-300 border-b border-line">
                <th scope="row" className="py-3 text-left">
                  <strong className="text-title">54312452</strong>
                </th>
                <td className="py-3">
                  <Link href={'/product/default'} className="product flex items-center gap-3">
                    <Image
                      src={'/images/product/1000x1000.png'}
                      width={400}
                      height={400}
                      alt="Contrasting sweatshirt"
                      className="flex-shrink-0 w-12 h-12 rounded"
                    />
                    <div className="info flex flex-col">
                      <div className="product-name">Contrasting sweatshirt</div>
                      <div className="caption1 text-secondary mt-1">XL / Yellow</div>
                    </div>
                  </Link>
                </td>
                <td className="py-3 price">$45.00</td>
                <td className="py-3 text-right">
                  <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-yellow text-yellow caption1 font-semibold">
                    Pending
                  </span>
                </td>
              </tr>
              <tr className="item duration-300 border-b border-line">
                <th scope="row" className="py-3 text-left">
                  <strong className="text-title">54312452</strong>
                </th>
                <td className="py-3">
                  <Link href={'/product/default'} className="product flex items-center gap-3">
                    <Image
                      src={'/images/product/1000x1000.png'}
                      width={400}
                      height={400}
                      alt="Faux-leather trousers"
                      className="flex-shrink-0 w-12 h-12 rounded"
                    />
                    <div className="info flex flex-col">
                      <div className="product-name">Faux-leather trousers</div>
                      <div className="caption1 text-secondary mt-1">M / Black</div>
                    </div>
                  </Link>
                </td>
                <td className="py-3 price">$45.00</td>
                <td className="py-3 text-right">
                  <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-purple text-purple caption1 font-semibold">
                    Delivery
                  </span>
                </td>
              </tr>
              <tr className="item duration-300 border-b border-line">
                <th scope="row" className="py-3 text-left">
                  <strong className="text-title">54312452</strong>
                </th>
                <td className="py-3">
                  <Link href={'/product/default'} className="product flex items-center gap-3">
                    <Image
                      src={'/images/product/1000x1000.png'}
                      width={400}
                      height={400}
                      alt="V-neck knitted top"
                      className="flex-shrink-0 w-12 h-12 rounded"
                    />
                    <div className="info flex flex-col">
                      <div className="product-name">V-neck knitted top</div>
                      <div className="caption1 text-secondary mt-1">S / White</div>
                    </div>
                  </Link>
                </td>
                <td className="py-3 price">$45.00</td>
                <td className="py-3 text-right">
                  <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-success text-success caption1 font-semibold">
                    Completed
                  </span>
                </td>
              </tr>
              <tr className="item duration-300 border-b border-line">
                <th scope="row" className="py-3 text-left">
                  <strong className="text-title">54312452</strong>
                </th>
                <td className="py-3">
                  <Link href={'/product/default'} className="product flex items-center gap-3">
                    <Image
                      src={'/images/product/1000x1000.png'}
                      width={400}
                      height={400}
                      alt="Contrasting sweatshirt"
                      className="flex-shrink-0 w-12 h-12 rounded"
                    />
                    <div className="info flex flex-col">
                      <div className="product-name">Contrasting sweatshirt</div>
                      <div className="caption1 text-secondary mt-1">XL / Yellow</div>
                    </div>
                  </Link>
                </td>
                <td className="py-3 price">$45.00</td>
                <td className="py-3 text-right">
                  <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-yellow text-yellow caption1 font-semibold">
                    Pending
                  </span>
                </td>
              </tr>
              <tr className="item duration-300 border-b border-line">
                <th scope="row" className="py-3 text-left">
                  <strong className="text-title">54312452</strong>
                </th>
                <td className="py-3">
                  <Link href={'/product/default'} className="product flex items-center gap-3">
                    <Image
                      src={'/images/product/1000x1000.png'}
                      width={400}
                      height={400}
                      alt="Faux-leather trousers"
                      className="flex-shrink-0 w-12 h-12 rounded"
                    />
                    <div className="info flex flex-col">
                      <div className="product-name">Faux-leather trousers</div>
                      <div className="caption1 text-secondary mt-1">M / Black</div>
                    </div>
                  </Link>
                </td>
                <td className="py-3 price">$45.00</td>
                <td className="py-3 text-right">
                  <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-purple text-purple caption1 font-semibold">
                    Delivery
                  </span>
                </td>
              </tr>
              <tr className="item duration-300">
                <th scope="row" className="py-3 text-left">
                  <strong className="text-title">54312452</strong>
                </th>
                <td className="py-3">
                  <Link href={'/product/default'} className="product flex items-center gap-3">
                    <Image
                      src={'/images/product/1000x1000.png'}
                      width={400}
                      height={400}
                      alt="V-neck knitted top"
                      className="flex-shrink-0 w-12 h-12 rounded"
                    />
                    <div className="info flex flex-col">
                      <div className="product-name">V-neck knitted top</div>
                      <div className="caption1 text-secondary mt-1">S / White</div>
                    </div>
                  </Link>
                </td>
                <td className="py-3 price">$45.00</td>
                <td className="py-3 text-right">
                  <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-red text-red caption1 font-semibold">
                    Canceled
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
