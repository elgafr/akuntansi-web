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
                <Input id="nim" type="text" placeholder="NIM" required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center"></div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  required
                />
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Link href="/dashboard">
              <Button type="submit" className="w-full">
                Login
              </Button>
              </Link>
            </div>
          </form>
          <Link href="/register">
            <Button variant="outline" className="w-full mt-4">
              Sign Up
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}