import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
};

export const metadata: Metadata = {
	title: 'The Manager Life',
	description: 'Restaurant Resources for Managers',
	icons: {
		icon: '/newLogo.png',
	},
	metadataBase: new URL('https://www.themanagerlife.com'),
	alternates: {
		canonical: '/',
		languages: {
			'en-US': '/en-US',
		},
	},
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
				<Toaster />
				{children}
			</body>
		</html>
	);
}
