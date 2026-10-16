import { Plus_Jakarta_Sans, Syne, Space_Mono } from "next/font/google";
import "@/index.css";
import ClientRoot from "./ClientRoot";

// Same type system as rishabmahor.vercel.app: Jakarta (body), Syne (display), Space Mono (labels)
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata = {
  title: "Speed: Cab booking App",
  description: "Cab booking app",
  icons: { icon: "/speed-logo.png" },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${syne.variable} ${spaceMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
