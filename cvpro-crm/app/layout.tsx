import "./globals.css";
import React from "react";

export const metadata = {
  title: "CVPro CRM",
  description: "CVPro.ae omnichannel CRM dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
