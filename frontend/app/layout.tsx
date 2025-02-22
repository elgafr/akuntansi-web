import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AccountProvider } from "@/contexts/AccountContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { Toaster } from "@/components/ui/sonner";



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Accounting App",
  description: "Simple accounting application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AccountProvider>
          <TransactionProvider>
            {children}
          </TransactionProvider>
        </AccountProvider>
        <Toaster />
      </body>
    </html>
  );
}
