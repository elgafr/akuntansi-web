'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "@/lib/axios"; // Mengimpor axios yang sudah dikonfigurasi
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"; // Ikon mata untuk toggle

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State untuk kontrol visibility password
  const [error, setError] = useState<string>(""); // Definisikan state error

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Kirim request POST ke backend dengan data registrasi
      const response = await axios.post("/mahasiswa/register", {
        name,
        email,
        nim,
        password,
      });
  
      if (response.data.success) {
        // Jika registrasi sukses, arahkan ke halaman OTP
        window.location.href = `/otp?email=${encodeURIComponent(email)}`;
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (error: any) {
      if (error.response) {
        // Tangani kesalahan yang dikirim oleh server
        console.error("Server Error:", error.response.data);
  
        if (error.response?.data?.errors?.email) {
          setError("The email has already been taken.");
        } else {
          setError(error.response?.data?.message || "An error occurred during registration.");
        }
      } else {
        // Tangani kesalahan jika tidak ada response dari server
        console.error("Network Error:", error.message);
        setError("Network error, please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // Fungsi untuk toggle visibility password
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create your ID</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Input
                  id="name"
                  type="text"
                  placeholder="Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Input
                  id="nim"
                  type="text"
                  placeholder="NIM"
                  required
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Password Field with Toggle */}
              <div className="relative grid gap-2">
                <Input
                  id="password"
                  type={passwordVisible ? "text" : "password"} // Toggle between text and password
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl pr-10" // Add padding-right to make space for the icon
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility} // Toggle password visibility
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {passwordVisible ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms2" className="rounded-xl" />
                <label
                  htmlFor="terms2"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  By proceeding, you agree to the{" "}
                  <span className="text-destructive">Terms and Conditions</span>
                </label>
              </div>
              <Button
                type="submit"
                className="w-full bg-destructive rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing up..." : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-destructive">Login Now</span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
