"use client";

import { googleAuthenticate } from "@/actions/google-login";
import React, { useActionState } from "react";
import { FcGoogle } from "react-icons/fc";

const GoogleLogin = () => {
  const [errorMsgGoogle, dispatchGoogle] = useActionState(googleAuthenticate, undefined);
  
  return (
    <form action={dispatchGoogle}>
      <button
        aria-label="Sign in with Google"
        className="button-main bg-transparent w-full flex items-center justify-center gap-2 text-black border border-gray-300"
        type="submit"
      >
        Continue with Google
        <FcGoogle size={20} />
      </button>
      {errorMsgGoogle && (
        <p className="text-red-500 text-sm mt-2 text-center">{errorMsgGoogle}</p>
      )}
    </form>
  );
};

export default GoogleLogin;
