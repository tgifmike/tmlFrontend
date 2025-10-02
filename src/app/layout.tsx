import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/Theme-Provider";

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
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Toaster />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
