import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "UNTRACED | Zero-Knowledge Verification Suite",
  description:
    "Build privacy-preserving verification flows with modular ZK modules. Prove attributes without revealing data.",
  keywords: ["zkTLS", "zero-knowledge", "verification", "privacy", "Web3", "KYC"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased bg-untraced-light text-untraced-dark`}
      >
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
