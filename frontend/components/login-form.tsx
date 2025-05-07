"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import axios from "@/lib/axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/login `, {
        nim: nim.trim(),
        password
      });

      if (response.data.success) {
        // Simpan data sesuai response backend
        const { token, nama, nim, email,id } = response.data.data;
        console.log(response.data)
        // Simpan token dan data user ke localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify({
          id,
          nama,
          nim,
          email
        }));

        // Set header axios untuk request berikutnya
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Redirect ke halaman perusahaan
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast(
        // error.response?.data?.message || 
        "Login gagal. Periksa NIM dan password Anda"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Login
          </CardTitle>
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
                  onChange={(e) => setNim(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              
              <div className="relative grid gap-2">
                <Input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {passwordVisible ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-destructive rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sedang masuk..." : "Masuk"}
              </Button>
            </div>
          </form>

          {error && <div className="text-red-500 text-center mt-4">{error}</div>}

          <div className="mt-4 text-center">
            <span className="text-sm">Belum punya akun? </span>
            <Link href="/register" className="text-sm text-destructive underline">
              Daftar disini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}