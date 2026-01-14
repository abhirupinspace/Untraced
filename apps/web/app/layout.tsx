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
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
};

const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: "group flex items-start gap-3 w-full p-4 rounded-xl border bg-card shadow-lg",
              title: "text-sm font-medium text-foreground",
              description: "text-xs text-muted-foreground mt-0.5",
              actionButton: "bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors",
              cancelButton: "bg-secondary text-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-secondary/80 transition-colors",
              success: "border-success/20 [&>svg]:text-success",
              error: "border-destructive/20 [&>svg]:text-destructive",
              warning: "border-warning/20 [&>svg]:text-warning",
              info: "border-primary/20 [&>svg]:text-primary",
            },
          }}
        />
      </body>
    </html>
  );
}
