'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer';
import Sidebar from '@/components/MyAccount/Sidebar';
import Dashboard from '@/components/MyAccount/Dashboard';
import HistoryOrders from '@/components/MyAccount/HistoryOrders';
import MyAddress from '@/components/MyAccount/MyAddress';
import Settings from '@/components/MyAccount/Settings';
import { useAccountStore } from '@/store/accountStore';

export default function MyAccountClient() {
  const { openDetail, setOpenDetail } = useAccountStore();

  return (
    <>
      <div id="header" className="relative w-full">
        <Breadcrumb heading="My Account" />
      </div>
      <div className="profile-block md:py-20 py-10">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col w-full">
            <Sidebar />
            <div className="right md:w-2/3 w-full pl-2.5">
              <Dashboard />
              <HistoryOrders />
              <MyAddress />
              <Settings />
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
