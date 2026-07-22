"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ 
  children, 
  isLoggedIn 
}: { 
  children: React.ReactNode; 
  isLoggedIn: boolean;
}) {
  const pathname = usePathname();

  // Pages where we want to hide Navbar
  const hideNavbarPages = ['/form', '/ambassador', '/admin'];
  const shouldHideNavbar = hideNavbarPages.some(page => pathname.startsWith(page));

  // Pages where we want to hide Footer
  const hideFooterPages = ['/form', '/ambassador'];
  const shouldHideFooter = hideFooterPages.some(page => pathname.startsWith(page));

  return (
    <>
      {/* Conditionally render Navbar */}
      {!shouldHideNavbar && <Navbar isLoggedIn={isLoggedIn} />}
      
      <main>{children}</main>
      
      {/* Conditionally render Footer */}
      {!shouldHideFooter && <Footer />}
    </>
  );
}