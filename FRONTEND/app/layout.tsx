import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import BootstrapClient from "@/components/BootstrapClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "BookMyDoctor – Your Health, Our Priority",
  description: "Connect with top doctors and book appointments online with ease.",
  keywords: ["doctor appointment", "healthcare", "book doctor online", "medical services"],
  authors: [{ name: "BookMyDoctor Team" }],
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
          <BootstrapClient />
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          {authModal}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

