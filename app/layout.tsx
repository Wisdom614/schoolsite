import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair" 
});

export const metadata: Metadata = {
  title: "St. Bernard Secondary School | Excellence in Education, Digital by Design",
  description: "Welcome to St. Bernard Secondary School, Molyko - Buea. Where tradition meets innovation in shaping tomorrow's leaders.",
  keywords: "school, education, Cameroon, Buea, secondary school, excellence",
  authors: [{ name: "St. Bernard Secondary School" }],
  openGraph: {
    title: "St. Bernard Secondary School",
    description: "Excellence in Education, Digital by Design",
    url: "https://stbernard.edu.cm",
    siteName: "St. Bernard Secondary School",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#f59e0b',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}