import * as React from "react"
 
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

export function Success() {
  return (
    <Card className="w-[400px]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">Success</CardTitle>
        <CardDescription>Account created successfully</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 mb-14 mt-2 items-center">
        <img
          src="/assets/image/success.png"
          alt="Success"
          width={180}
        //   height={300}
          className="mb-4"
          
        />
        <div className="text-center text-sm"></div>
          <span className="text-muted-foreground text-center">
            Email Verified Successfully
          </span>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none w-full">
            <Link href="/login" className="w-full">
          <Button className="w-full rounded-xl">
            back to Login
          </Button>
            </Link>
        </div>
      </CardFooter>
    </Card>
  )
}