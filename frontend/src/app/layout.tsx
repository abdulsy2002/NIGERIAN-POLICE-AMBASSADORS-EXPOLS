import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "EX-POLS Kano",
  description: "Nigerian Police Ambassadors",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session");
  const isLoggedIn = !!userSession;

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <LayoutWrapper isLoggedIn={isLoggedIn}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}