import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ANGGA PART — Official Store",
    template: "%s · ANGGA PART",
  },
  description:
    "ANGGA PART — Official Store: toko resmi komponen, aksesori, dan perlengkapan pilihan. Presisi. Performa. Kesempurnaan.",
  applicationName: "ANGGA PART",
  icons: {
    icon: [
      { rel: "icon", url: "/logo-ap.png", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: ["/logo-ap.png"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: "ANGGA PART",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "ANGGA PART — Official Store",
    description:
      "Toko resmi ANGGA PART: presisi, performa, kesempurnaan.",
    type: "website",
    siteName: "ANGGA PART",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
