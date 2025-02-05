"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function InputOTPControlled() {
  const [value, setValue] = React.useState("");

  return (
    <Card className="w-[350px]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">Input OTP</CardTitle>
        <CardDescription>Enter the OTP sent to your email</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 mb-14 mt-2 items-center">
      <InputOTP
        maxLength={4}
        value={value}
        onChange={(value) => setValue(value)}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
      <div className="text-center text-sm">
        <span className="text-muted-foreground"></span>
        Didn&apos;t your receive the OTP?{" "}
        <Button variant="link" className="p-0">
          Resend OTP
        </Button>
      </div>
      </CardContent>
      <CardFooter>
        <Link href="/success" className="w-full">
        <Button className="w-full rounded-xl">Verify</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
