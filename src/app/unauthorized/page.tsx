'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, LockKeyhole, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';

export default function UnauthorizedPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 flex items-center justify-center px-6 py-10">
			<div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
				{/* LEFT BRAND PANEL */}
				<div className="hidden lg:flex flex-col justify-center space-y-6">
					<div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border">
						<ShieldAlert className="h-8 w-8 text-primary" />
					</div>

					<div className="space-y-3">
						<p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
							Secure Workspace
						</p>

						<h1 className="text-5xl font-bold tracking-tight leading-tight">
							Access Restricted
						</h1>

						<p className="text-lg text-muted-foreground max-w-xl">
							Your account is authenticated, but you don’t currently have the
							required permissions to open this area of the platform.
						</p>
					</div>

					<div className="grid gap-3">
						<div className="rounded-2xl border bg-card p-4">
							<p className="font-medium">Typical reasons:</p>
							<ul className="mt-2 text-sm text-muted-foreground space-y-1">
								<li>• Admin-only route</li>
								<li>• Account role mismatch</li>
								<li>• Access not yet granted</li>
								<li>• Session role needs refresh</li>
							</ul>
						</div>
					</div>
				</div>

				{/* RIGHT CARD */}
				<Card className="border shadow-2xl rounded-3xl">
					<CardHeader className="space-y-4 pb-2">
						<div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
							<LockKeyhole className="h-8 w-8 text-destructive" />
						</div>

						<div className="text-center space-y-2">
							<CardTitle className="text-3xl font-bold">
								403 Unauthorized
							</CardTitle>

							<CardDescription className="text-base">
								You do not have permission to view this page.
							</CardDescription>
						</div>
					</CardHeader>

					<CardContent className="space-y-6 pt-4">
						<div className="rounded-2xl bg-muted/50 border p-4 text-sm text-muted-foreground">
							If you believe this is incorrect, contact your administrator or
							sign in again to refresh your permissions.
						</div>

						<div className="grid gap-3">
							<Button asChild size="lg" className="rounded-2xl">
								<Link href="/dashboard">
									<Home className="mr-2 h-4 w-4" />
									Return to Dashboard
								</Link>
							</Button>

							<Button
								variant="outline"
								asChild
								size="lg"
								className="rounded-2xl"
							>
								<Link href="/login">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Sign In Again
								</Link>
							</Button>

							<Button variant="ghost" asChild size="lg" className="rounded-2xl">
								<Link href="/contact">
									<Mail className="mr-2 h-4 w-4" />
									Request Access
								</Link>
							</Button>
						</div>

						<p className="text-center text-xs text-muted-foreground">
							Need help? Your admin can update roles and access permissions.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
