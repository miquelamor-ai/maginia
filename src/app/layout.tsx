import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marc General IA - Jesuïtes Educació",
  description: "Una exploració humanista sobre la integració de la intel·ligència artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
