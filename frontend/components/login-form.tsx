import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Login to your account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Input
                  id="nim"
                  type="text"
                  placeholder="NIM"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center"></div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="rounded-xl"
                />
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms2" className="rounded-xl" />
                    <label
                      htmlFor="terms2"
                      className="text-xs font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>
                  <a
                    href="#"
                    className="text-sm underline-offset-4 hover:underline text-destructive"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>
              <Link href="/perusahaan">
                <Button
                  type="submit"
                  className="w-full bg-destructive rounded-xl"
                >
                  Login
                </Button>
              </Link>
            </div>
          </form>
          <Link href="/register">
            <Button variant="outline" className="w-full mt-4 rounded-xl border-destructive text-destructive">
              Sign Up
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
