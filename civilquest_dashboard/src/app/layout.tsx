import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import AuthProvider from "@/providers/AuthProvider";
import DashboardWrapper from "./dashboardWrapper";
import SideBar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Civil Quest Dashboard",
  description: "Administrative dashboard for Civil Quest application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <DashboardWrapper>
            <div className="flex min-h-screen">
              <SideBar />
              <div className="flex-1 sm:ml-64">
                <DashboardHeader />
                <main className="bg-gray-50">{children}</main>
              </div>
            </div>
          </DashboardWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
