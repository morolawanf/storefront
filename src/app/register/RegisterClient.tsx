"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import RegisterForm from "@/components/forms/RegisterForm";
import GoogleLogin from "@/components/Other/GoogleLogin";
import { signOut } from "next-auth/react";
import { GetCountries } from "react-country-state-city";
import { Country } from "react-country-state-city/dist/esm/types";


export default function RegisterClient() {
    const [countriesList, setCountriesList] = useState<Country[]>([]);
  useEffect(() => {
    GetCountries().then((result) => {
      setCountriesList(result);
    });
  }, []);
  return (
    <div className="content-main flex gap-y-8 flex-col">
      <div className="left w-full">
        <div className="heading4 text-center">Register</div>
        <RegisterForm />
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-line" />
          <span className="mx-4 text-secondary font-medium">OR</span>
          <div className="flex-grow h-px bg-line" />
        </div>
        <div className="block-button mt-2">
          <GoogleLogin />
        </div>

      </div>
    </div>
  );
}
