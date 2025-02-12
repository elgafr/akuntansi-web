'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import axios from "@/lib/axios"; // Mengimpor axios yang sudah dikonfigurasi
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"; // Ikon mata untuk toggle

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [nim, setNim] = useState(""); // Menyimpan NIM
  const [password, setPassword] = useState(""); // Menyimpan password
  const [isSubmitting, setIsSubmitting] = useState(false); // Menangani status submit
  const [error, setError] = useState(""); // Menangani error jika login gagal
  const [passwordVisible, setPasswordVisible] = useState(false); // Menyimpan status visibility password

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Set status submitting ke true

    try {
      const response = await axios.post("/mahasiswa/login", { nim, password }); // Kirim data login ke backend
      console.log(response.data); // Cek respons sukses

      // Jika login berhasil, redirect ke halaman setelah login
      window.location.href = "/perusahaan"; // Ganti URL tujuan setelah login berhasil
    } catch (error) {
      setError("Invalid credentials"); // Menangani error jika login gagal
    } finally {
      setIsSubmitting(false); // Set status submitting ke false setelah selesai
    }
  };

  // Fungsi untuk toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible); // Membalikkan status passwordVisible
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Input
                  id="nim"
                  type="text"
                  placeholder="NIM"
                  required
                  value={nim}
                  onChange={(e) => setNim(e.target.value)} // Update nim state
                  className="rounded-xl"
                />
              </div>
              <div className="relative grid gap-2">
                <Input
                  id="password"
                  type={passwordVisible ? "text" : "password"} // Toggle antara "text" dan "password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Update password state
                  className="rounded-xl pr-10" // Add padding for the eye icon button
                />
                {/* Tombol mata untuk toggle password */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility} // Fungsi toggle
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {passwordVisible ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
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
              <Button
                type="submit"
                className="w-full bg-destructive rounded-xl"
                disabled={isSubmitting} // Disable button saat sedang submit
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>

          {/* Menampilkan pesan error jika login gagal */}
          {error && <div className="text-red-500 text-center">{error}</div>}

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
