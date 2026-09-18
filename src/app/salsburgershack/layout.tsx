import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: {
		absolute: "Sal's Burger Shack",
		template: "%s | Sal's Burger Shack",
	},
	description: "Legal information for the Sal's Burger Shack game.",
	robots: {
		index: true,
		follow: false,
	},
};

export default function SalsBurgerShackLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="min-h-screen bg-[#fff8e8] text-[#2b160d] selection:bg-[#f5bd31]/40">
			{children}
		</div>
	);
}
