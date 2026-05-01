'use client';

import { ThemeSelect } from '@/components/theme/ModeToggle';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
	return (
		<div className="max-w-2xl mx-auto px-6 py-10 space-y-10">
			{/* PAGE TITLE */}
			<div>
				<h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
				<p className="text-muted-foreground text-sm mt-1">
					Manage your app preferences and account settings
				</p>
			</div>

			{/* ===== APPEARANCE SECTION ===== */}
			<section className="space-y-3">
				<h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					Appearance
				</h2>

				<Card className="rounded-xl overflow-hidden border shadow-sm">
					{/* ROW */}
					<div className="flex items-center justify-between px-4 py-3">
						<div>
							<p className="font-medium">Theme</p>
							<p className="text-sm text-muted-foreground">
								Light, dark, or system appearance
							</p>
						</div>

						<ThemeSelect />
					</div>

					{/* <Separator />

					{/* ROW (example placeholder for future settings) */}
					{/* <div className="flex items-center justify-between px-4 py-3">
						<div>
							<p className="font-medium">Reduce motion</p>
							<p className="text-sm text-muted-foreground">
								Limit animations across the app
							</p>
						</div>

						<Switch />
					</div> */}
				</Card> 
			</section>

			{/* ===== ACCOUNT SECTION ===== */}
			{/* <section className="space-y-3">
				<h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					Account
				</h2>

				<Card className="rounded-xl overflow-hidden border shadow-sm">
					<div className="flex items-center justify-between px-4 py-3">
						<div>
							<p className="font-medium">Profile</p>
							<p className="text-sm text-muted-foreground">
								Update your personal information
							</p>
						</div>

						<Button variant="outline" size="sm">
							Edit
						</Button>
					</div>

					<Separator />

					<div className="flex items-center justify-between px-4 py-3">
						<div>
							<p className="font-medium text-destructive">Delete account</p>
							<p className="text-sm text-muted-foreground">
								Permanently remove your account
							</p>
						</div>

						<Button variant="destructive" size="sm">
							Delete
						</Button>
					</div>
				</Card>
			</section> */}

			{/* ===== ADVANCED SECTION ===== */}
			{/* <section className="space-y-3">
				<h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					Advanced
				</h2>

				<Card className="rounded-xl overflow-hidden border shadow-sm">
					<div className="flex items-center justify-between px-4 py-3">
						<div>
							<p className="font-medium">Developer mode</p>
							<p className="text-sm text-muted-foreground">
								Show advanced debugging tools
							</p>
						</div>

						<Switch />
					</div>
				</Card>
			</section> */}
		</div>
	);
}
