"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { GoogleLogo } from "@phosphor-icons/react";
import { GetCountries } from "react-country-state-city";
import { Country } from "react-country-state-city/dist/esm/types";
import { BsGoogle } from "react-icons/bs";

const Register = () => {
  const [countriesList, setCountriesList] = useState<Country[]>([]);
  useEffect(() => {
    GetCountries().then((result) => {
      setCountriesList(result);
    });
  }, []);
  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
      </div>
      <div className="register-block md:py-20 py-10">
        <div className="container !max-w-[650px]">
          <div className="content-main flex gap-y-8 flex-col">
            <div className="left w-full">
              <div className="heading4 text-center">Register</div>
              <form className="md:mt-7 mt-4">
                <div className="flex gap-4 max-lg:flex-col">
                  <div className="flex-1 ">
                    <input
                      className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                      id="firstname"
                      type="text"
                      placeholder="First Name *"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                      id="lastname"
                      type="text"
                      placeholder="Last Name *"
                      required
                    />
                  </div>
                </div>
                <div className="country mt-5">
                  <select className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="country" placeholder="Country *" required>
                    {countriesList.map((country, index) => (
                      <option value={country.name} key={country.id}>
                        <span>{country.emoji}</span>
                        <span>{country.name}</span>
                      </option>
                    ))}
                  </select>
                </div>
                <div className="email mt-5">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="email"
                    type="email"
                    placeholder="Email address *"
                    required
                  />
                </div>
                <div className="flex gap-4 max-lg:flex-col mt-5">
                  <div className="pass flex-1">
                    <input
                      className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                      id="password"
                      type="password"
                      placeholder="Password *"
                      required
                    />
                  </div>
                  <div className="confirm-pass flex-1">
                    <input
                      className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm Password *"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center mt-5">
                  <div className="block-input">
                    <input type="checkbox" name="remember" id="remember" />
                    <Icon.CheckSquare size={20} weight="fill" className="icon-checkbox" />
                  </div>
                  <label htmlFor="remember" className="pl-2 cursor-pointer text-secondary2">
                    I agree to the
                    <Link href={"#!"} className="text-black hover:underline pl-1">
                      Terms of User
                    </Link>
                  </label>
                </div>
                <div className="block-button md:mt-7 mt-4">
                  <button className="button-main w-full">Register</button>
                </div>

                <div className="block-button md:mt-4 mt-4">
                  <button className="button-main flex items-center justify-center gap-2">
                    <BsGoogle size={20} />
                  </button>
                </div>
              </form>
              <GoogleLogo />
            </div>
            <div className="right w-full flex items-center">
              <div className="text-content">
                <div className="heading4">Already have an account?</div>
                <div className="mt-2 text-secondary">
                  Welcome back. Sign in to access your personalized experience, saved preferences, and more. We{String.raw`'re`} thrilled to
                  have you with us again!
                </div>
                <div className="block-button md:mt-7 mt-4">
                  <Link href={"/login"} className="button-main">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
