"use client";

import React from "react";
import { useForgotPasswordStore } from "@/store/useForgotPasswordStore";
import Stage1EmailForm from "./ForgotPassword/Stage1EmailForm";
import Stage2OTPForm from "./ForgotPassword/Stage2OTPForm";
import Stage3PasswordForm from "./ForgotPassword/Stage3PasswordForm";

export default function ForgotPasswordForm() {
  const currentStage = useForgotPasswordStore((state) => state.currentStage);

  return (
    <div>
      {currentStage === 1 && <Stage1EmailForm />}
      {currentStage === 2 && <Stage2OTPForm />}
      {currentStage === 3 && <Stage3PasswordForm />}
    </div>
  );
}
