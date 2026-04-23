import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/Theme-Provider";
import NavBar from "@/components/navBar/NavBar";
import { Analytics } from '@vercel/analytics/next';
import Footer from "@/components/navBar/Footer";
import { TooltipProvider } from '@/components/ui/tooltip';
import { SessionProvider } from "@/lib/auth/session-context";
import AuthGuard from "@/lib/auth/AuthGuard";



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
	title: {
		default: 'The Manager Life | Digital Line Check App for Restaurants',
		template: '%s | The Manager Life',
	},
	description:
		'Create digital restaurant line checks, improve food safety compliance, increase health inspection readiness, and run kitchen operations from iPad. Built for restaurant managers and multi-location teams.',

	keywords: [
		'restaurant line check app',
		'digital line checks',
		'kitchen food safety checklist',
		'health inspection readiness',
		'restaurant operations software',
		'restaurant manager tools',
		'HACCP checklist app',
		'restaurant iPad checklist',
	],

	metadataBase: new URL('https://www.themanagerlife.com'),

	openGraph: {
		title: 'Digital Line Check System for Restaurants',
		description:
			'Create stations, assign items, and run food safety line checks from your iPad. Improve inspection scores and kitchen readiness.',
		url: 'https://www.themanagerlife.com',
		siteName: 'The Manager Life',
		type: 'website',
		images: [
			{
				url: '/newLogo.png',
				width: 1200,
				height: 630,
				alt: 'The Manager Life Line Check Platform',
			},
		],
	},

	twitter: {
		card: 'summary_large_image',
		title: 'Restaurant Line Check App',
		description:
			'Run kitchen line checks digitally and improve food safety inspection readiness.',
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col mt-20`}
			>
			  <SessionProvider>
				  <AuthGuard>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<TooltipProvider>
							<NavBar />
							<main className="flex-1 w-full ">{children}</main>
							<Footer />
							<Analytics />
							<Toaster />
						</TooltipProvider>
					  </ThemeProvider>
					  </AuthGuard>
				</SessionProvider>

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
								'Digital restaurant line check software that helps managers create stations, assign checklist items, and perform food safety inspections from iPad to improve health inspection readiness.',

							featureList: [
								'Digital restaurant line checks',
								'Station-based checklist builder',
								'Food safety tracking',
								'iPad kitchen execution',
								'Health inspection readiness tools',
								'Multi-location restaurant support',
							],

							audience: {
								'@type': 'Audience',
								audienceType:
									'Restaurant managers, kitchen managers, multi-location restaurant operators',
							},

							offers: {
								'@type': 'Offer',
								price: '0',
								priceCurrency: 'USD',
							},

							provider: {
								'@type': 'Organization',
								name: 'The Manager Life',
								url: 'https://www.themanagerlife.com',
								logo: 'https://www.themanagerlife.com/newLogo.png',
							},
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

							sameAs: ['https://twitter.com/', 'https://linkedin.com/'],
						}),
					}}
				/>

				<script
					src="https://accounts.google.com/gsi/client"
					async
					defer
				></script>
				<script src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"></script>
			</body>
		</html>
	);
}
