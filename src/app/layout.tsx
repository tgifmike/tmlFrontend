import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme/Theme-Provider';
import NavBar from '@/components/navBar/NavBar';
import Footer from '@/components/navBar/Footer';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SessionProvider } from '@/lib/auth/session-context';

import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
};

export const metadata: Metadata = {
	title: {
		default: 'The Manager Life | Digital Line Check App for Restaurants',
		template: '%s | The Manager Life',
	},
	description:
		'Create digital restaurant line checks, improve food safety compliance, and run kitchen operations from iPad.',

	metadataBase: new URL('https://www.themanagerlife.com'),

	openGraph: {
		title: 'Digital Line Check System for Restaurants',
		description:
			'Run kitchen line checks digitally and improve food safety inspection readiness.',
		url: 'https://www.themanagerlife.com',
		siteName: 'The Manager Life',
		type: 'website',
		images: [
			{
				url: '/newLogo.png',
				width: 1200,
				height: 630,
				alt: 'The Manager Life',
			},
		],
	},

	twitter: {
		card: 'summary_large_image',
		title: 'Restaurant Line Check App',
		description:
			'Run kitchen line checks digitally and improve food safety readiness.',
		images: ['/newLogo.png'],
	},

	icons: {
		icon: '/newLogo.png',
	},

	alternates: {
		canonical: '/',
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col pt-23`}
			>
				{/* GLOBAL PROVIDERS ONLY */}
				<SessionProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<TooltipProvider>
							{/* PUBLIC SITE */}
							<NavBar />

							<main className="flex-1 w-full">{children}</main>

							<Footer />

							<Toaster />
							<Analytics />
						</TooltipProvider>
					</ThemeProvider>
				</SessionProvider>

				{/* JSON-LD */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'SoftwareApplication',
							name: 'The Manager Life',
							url: 'https://www.themanagerlife.com',
							applicationCategory: 'BusinessApplication',
							operatingSystem: 'Web, iOS',
							description:
								'Digital restaurant line check software for food safety and inspections.',
						}),
					}}
				/>

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'Organization',
							name: 'The Manager Life',
							url: 'https://www.themanagerlife.com',
							logo: 'https://www.themanagerlife.com/newLogo.png',
						}),
					}}
				/>

				<script src="https://accounts.google.com/gsi/client" async defer />
				<script src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js" />
			</body>
		</html>
	);
}
