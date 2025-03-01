import React from "react";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuPet";
import WhatNewOne from "@/components/Home1/WhatNewOne";
import productData from "@/data/Product.json";
import Collection from "@/components/Home1/Collection";
import TabFeatures from "@/components/Home2/TabFeatures";
import Banner from "@/components/Home1/Banner";
import Benefit from "@/components/Home1/Benefit";
import testimonialData from "@/data/Testimonial.json";
import Testimonial from "@/components/Home1/Testimonial";
import Instagram from "@/components/Home1/Instagram";
import Brand from "@/components/Home1/Brand";
import Footer from "@/components/Footer/Footer";
import ModalNewsletter from "@/components/Modal/ModalNewsletter";
import SliderEleven from "@/components/Slider/SliderThree";

export default function Home() {
  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full">
        <MenuOne />
        <SliderEleven />
      </div>
      <WhatNewOne data={productData} start={0} limit={4} />
      <Collection />
      <TabFeatures data={productData} start={0} limit={30} />
      <br />
      <button>View more</button>
      <Brand />
      <Benefit props="md:py-20 py-10" />
      <Footer />
      <ModalNewsletter />
    </>
  );
}
