"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { isLoading, isSignedIn, user } = useUser();
  const router = useRouter();
  // Redirect user with admin role to admin page
  useEffect(() => {
    const role = user?.publicMetadata.role;
    if (role === "admin") {
      router.push("/admin");
    }
  }, [user, router]);

  return (
    <SignIn.Root>
      <SignIn.Step name="start">
        <h1>Sign in to your account</h1>

        <Clerk.Connection name="google">Sign in with Google</Clerk.Connection>

        <Clerk.Field name="identifier">
          <Clerk.Label>Email</Clerk.Label>
          <Clerk.Input />
          <Clerk.FieldError />
        </Clerk.Field>

        <SignIn.Action submit>Continue</SignIn.Action>
      </SignIn.Step>

      <SignIn.Step name="verifications">
        <SignIn.Strategy name="email_code">
          <h1>Check your email</h1>
          <p>
            We sent a code to <SignIn.SafeIdentifier />.
          </p>

          <Clerk.Field name="code">
            <Clerk.Label>Email code</Clerk.Label>
            <Clerk.Input />
            <Clerk.FieldError />
          </Clerk.Field>

          <SignIn.Action submit>Continue</SignIn.Action>
        </SignIn.Strategy>

        <SignIn.Strategy name="password">
          <h1>Enter your password</h1>

          <Clerk.Field name="password">
            <Clerk.Label>Password</Clerk.Label>
            <Clerk.Input />
            <Clerk.FieldError />
          </Clerk.Field>

          <SignIn.Action submit>Continue</SignIn.Action>
          <SignIn.Action navigate="forgot-password">
            Forgot password?
          </SignIn.Action>
        </SignIn.Strategy>

        <SignIn.Strategy name="reset_password_email_code">
          <h1>Check your email</h1>
          <p>
            We sent a code to <SignIn.SafeIdentifier />.
          </p>

          <Clerk.Field name="code">
            <Clerk.Label>Email code</Clerk.Label>
            <Clerk.Input />
            <Clerk.FieldError />
          </Clerk.Field>

          <SignIn.Action submit>Continue</SignIn.Action>
        </SignIn.Strategy>
      </SignIn.Step>

      <SignIn.Step name="forgot-password">
        <h1>Forgot your password?</h1>

        <SignIn.SupportedStrategy name="reset_password_email_code">
          Reset password
        </SignIn.SupportedStrategy>

        <SignIn.Action navigate="previous">Go back</SignIn.Action>
      </SignIn.Step>

      <SignIn.Step name="reset-password">
        <h1>Reset your password</h1>

        <Clerk.Field name="password">
          <Clerk.Label>New password</Clerk.Label>
          <Clerk.Input />
          <Clerk.FieldError />
        </Clerk.Field>

        <Clerk.Field name="confirmPassword">
          <Clerk.Label>Confirm password</Clerk.Label>
          <Clerk.Input />
          <Clerk.FieldError />
        </Clerk.Field>

        <SignIn.Action submit>Reset password</SignIn.Action>
      </SignIn.Step>
    </SignIn.Root>
  );
}
