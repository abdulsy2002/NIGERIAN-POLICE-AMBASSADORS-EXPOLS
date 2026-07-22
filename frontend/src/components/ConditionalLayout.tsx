// src/components/ConditionalLayout.tsx
"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const shouldHide = 
    pathname?.startsWith("/admin") || 
    pathname === "/form" || 
    pathname === "/ambassador";

  if (shouldHide) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar isLoggedIn={false} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}