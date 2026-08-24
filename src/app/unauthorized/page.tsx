import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, House, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
	title: 'Account Access',
	description: 'Request access to The Manager Life or return to the home page.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function UnauthorizedPage() {
	return (
		<section className="relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-6 py-20">
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-20 bg-gradient-to-br from-primary/5 via-background to-destructive/10"
			/>
			<div
				aria-hidden="true"
				className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
			/>

			<div className="w-full max-w-xl rounded-3xl border bg-background/90 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-12">
				<div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
					<ShieldAlert className="size-8" aria-hidden="true" />
				</div>

				<p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-destructive">
					Account not found
				</p>
				<h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
					This email doesn&apos;t have access yet
				</h1>
				<p className="mx-auto mt-4 max-w-md leading-relaxed text-muted-foreground">
					We couldn&apos;t find a Manager Life account connected to the email
					you used. Start a free trial and we&apos;ll help get your restaurant
					set up.
				</p>

				<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
					<Button size="lg" asChild>
						<Link href="/free-trial?plan=starter-trial">
							Start Free Trial
							<ArrowRight aria-hidden="true" />
						</Link>
					</Button>

					<Button size="lg" variant="outline" asChild>
						<Link href="/">
							<House aria-hidden="true" />
							Back to Home
						</Link>
					</Button>
				</div>

				<p className="mt-7 text-sm text-muted-foreground">
					Already have an account? Try signing in again with the email your
					team registered.
				</p>
			</div>
		</section>
	);
}
