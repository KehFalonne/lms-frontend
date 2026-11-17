import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";
import { WebSocketProvider } from "@/websocket/ws-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "GU-LMS", template: "%s | GU-LMS" },
  description: "Gracious University Learning Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen font-sans">
        <ThemeProvider>
          <QueryProvider>
            <WebSocketProvider>
              {children}
              <Toaster
                position="top-right"
                richColors
                closeButton
                visibleToasts={3}
                toastOptions={{
                  className: "sm:max-w-md",
                }}
                style={
                  {
                    // On very small screens, fit within safe areas
                  }
                }
              />
            </WebSocketProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
