'use client';

import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';

import Footer from '@/components/navBar/Footer';
import NavBar from '@/components/navBar/NavBar';
import { SessionProvider } from '@/lib/auth/session-context';
import { ThemeProvider } from '@/components/theme/Theme-Provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export default function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isSalsBurgerShack = pathname.startsWith('/salsburgershack');

	if (isSalsBurgerShack) {
		return <>{children}</>;
	}

	return (
		<SessionProvider>
			<ThemeProvider>
				<TooltipProvider>
					<div className="flex min-h-screen flex-col pt-20">
						<NavBar />
						<main className="flex-1 w-full">{children}</main>
						<Footer />
					</div>

					<Toaster />
					<Analytics />
				</TooltipProvider>
			</ThemeProvider>
		</SessionProvider>
	);
}
