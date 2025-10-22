import type { Metadata } from "next";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import LoginClient from "./LoginClient";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login - OEPlast",
  description: "Login to your OEPlast account",
};

export default async function LoginPage() {
  const session = await auth();
  
  // If user is already logged in, redirect to homepage
  if (session) {
    redirect("/");
  }

  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
      </div>
      <br />
      <div className="login-block md:py-20 py-10">
        <div className="container">
          <LoginClient />
        </div>
      </div>
      <Footer />
    </>
  );
}