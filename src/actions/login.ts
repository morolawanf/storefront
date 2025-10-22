"use server";

import { signIn, auth } from "../../auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export interface LoginActionResult {
  success: boolean;
  error?: string;
  emailVerified?: boolean;
}

export async function credentialsLogin(
  email: string,
  password: string,
  rememberMe?: boolean
): Promise<LoginActionResult> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Get the session to check email verification status
    const session = await auth();
    const emailVerified = !!session?.user?.emailVerified;

    return { 
      success: true,
      emailVerified 
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      // Generic error message for security - don't reveal if email exists
      return {
        success: false,
        error: "Invalid credentials. Please check your email and password.",
      };
    }

    // Catch-all for unexpected errors
    return {
      success: false,
      error: "Invalid credentials. Please try again.",
    };
  }
}
