import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'remixicon/fonts/remixicon.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Navbar } from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthProvider";
import { ToastContainer } from "react-toastify";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Buckwise - Your personal money manager",
  description: "A dedicated platform to manage money",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, interactive-widget=resizes-content"
        />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <main>
            <Navbar />
            {children}
          </main>
          <ToastContainer
            position="top-center"
            theme="dark"
            autoClose={3000}
            pauseOnHover
            closeButton
            hideProgressBar
          />
        </AuthProvider>
      </body>
    </html>
  );
}
