import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import BootstrapClient from "@/components/BootstrapClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";

export const metadata: Metadata = {
  title: "HouseMed – Professional Diagnosis in Your Neighborhood",
  description: "Connect with top experts in all major fields and book your appointment today.",
  keywords: ["doctor appointment", "healthcare", "HouseMed", "medical services"],
  authors: [{ name: "HouseMed Team" }],
};

export default function RootLayout({
  children,
  authModal,
}: Readonly<{
  children: React.ReactNode;
  authModal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <LocationProvider>
            <BootstrapClient />
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            {authModal}
            <Footer />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

