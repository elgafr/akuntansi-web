'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create your ID</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Input id="name" type="text" placeholder="Name" required className="rounded-xl"/>
              </div>
              <div className="grid gap-2">
                <Input id="email" type="email" placeholder="email" required className="rounded-xl"/>
              </div>
              <div className="grid gap-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Input id="nim" type="text" placeholder="NIM" required className="rounded-xl"/>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms2" className="rounded-xl"/>
                <label
                  htmlFor="terms2"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  By proceeding, you agree to the <span className="text-destructive">Terms and Conditions</span> 
                </label>
              </div>
              <Link href="/otp">
              <Button type="submit" className="w-full bg-destructive rounded-xl">
                Sign up
              </Button>
              </Link>
            </div>
            <Link href="/login">
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <span className="text-destructive">Login Now</span>
            </div>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
