"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import axios from "@/lib/axios"; // Pastikan untuk mengimpor axios yang sudah dikonfigurasi

export function InputOTPControlled() {
  const [value, setValue] = React.useState(""); // Menyimpan nilai OTP yang dimasukkan
  const [isVerifying, setIsVerifying] = React.useState(false); // Untuk menangani status verifikasi
  const [error, setError] = React.useState(""); // Menyimpan pesan kesalahan
  const [isResending, setIsResending] = React.useState(false); // Menangani status resend OTP
  const [email] = React.useState(""); // Menyimpan email pengguna (dari registrasi)

  // Fungsi untuk menangani perubahan nilai OTP
  const handleOTPChange = (newValue: string) => {
    if (newValue.length <= 6) {
      setValue(newValue); // Update nilai OTP
    }
  };

  // Fungsi untuk menangani verifikasi OTP
  const handleVerifyOTP = async () => {
    if (value.length === 6) {
      setIsVerifying(true); // Set status verifikasi ke true
      try {
        const response = await axios.post("/mahasiswa/verifikasi", { kode: value });
        console.log(response.data.message);
        // Redirect ke halaman setelah OTP berhasil diverifikasi
        window.location.href = "/success";
      } catch (error) {
        setError("Invalid OTP or OTP expired."); // Jika terjadi error
      } finally {
        setIsVerifying(false); // Set status verifikasi ke false
      }
    } else {
      setError("Please enter a 6-digit OTP.");
    }
  };

  // Fungsi untuk menangani pengiriman ulang OTP
  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const response = await axios.post("/mahasiswa/resendotp", { email: email });
      console.log(response.data.message);
      setError(""); // Reset error message jika resend berhasil
    } catch (error) {
      // Menangani error dan menampilkan pesan
      console.error(error.response?.data);
      setError(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };
  

  return (
    <Card className="w-[350px]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">Input OTP</CardTitle>
        <CardDescription>Enter the OTP sent to your email</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 mb-14 mt-2 items-center">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={(newValue) => handleOTPChange(newValue)} // Menangani perubahan nilai OTP
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        {/* Menampilkan error jika OTP tidak valid */}
        {error && <div className="text-red-500">{error}</div>}
        <div className="text-center text-sm">
          <span className="text-muted-foreground"></span>
          Didn&apos;t receive the OTP?{" "}
          <Button variant="link" className="p-0" onClick={handleResendOTP} disabled={isResending}>
            {isResending ? "Resending..." : "Resend OTP"}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full rounded-xl"
          onClick={handleVerifyOTP}
          disabled={isVerifying} // Disable button saat verifikasi
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
      </CardFooter>
    </Card>
  );
}
