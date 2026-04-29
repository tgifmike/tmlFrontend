import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
	title: 'Terms & Conditions | The Manager Life',
	description:
		'How The Manager Life Terms & Conditions apply to the application.',
};

const TermsPage = () => {
	return (
		<main className="min-h-screen bg-background py-16 px-6">
			<div className="max-w-3xl mx-auto space-y-6">
				{/* Header */}
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">
						Terms & Conditions
					</h1>
					<p className="text-muted-foreground text-sm">
						Effective date: April 29, 2026
					</p>
				</div>

				{/* Intro */}
				<Card>
					<CardContent className="pt-6 text-sm text-muted-foreground leading-relaxed">
						<p>
							These Terms & Conditions apply to The Manager Life web application
							(“Application”) provided by The Manager Life (“Service Provider”).
							By accessing or using the Application, you agree to be bound by
							these Terms.
						</p>
					</CardContent>
				</Card>

				{/* Intellectual Property */}
				<Card>
					<CardHeader>
						<CardTitle>1. Intellectual Property</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground space-y-2">
						<p>
							All content, branding, code, design, and functionality within the
							Application are the intellectual property of the Service Provider.
						</p>
						<p>
							Unauthorized copying, modification, reverse engineering, or
							creation of derivative works is strictly prohibited.
						</p>
					</CardContent>
				</Card>

				{/* Service Availability */}
				<Card>
					<CardHeader>
						<CardTitle>2. Service Availability & Changes</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground space-y-2">
						<p>
							We may update, modify, or discontinue features of the Application
							at any time without prior notice.
						</p>
						<p>
							If paid features are introduced in the future, they will be
							clearly communicated before activation.
						</p>
					</CardContent>
				</Card>

				{/* Accounts */}
				<Card>
					<CardHeader>
						<CardTitle>3. Authentication & Accounts</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground space-y-2">
						<p>
							The Application uses Google OAuth (via NextAuth) for
							authentication.
						</p>
						<p>
							You are responsible for maintaining the security of your account.
							We are not responsible for unauthorized access resulting from
							compromised credentials.
						</p>
					</CardContent>
				</Card>

				{/* Device Responsibility */}
				<Card>
					<CardHeader>
						<CardTitle>4. Device Responsibility</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						<p>
							You are responsible for maintaining the security and integrity of
							your device. Modifying your device (e.g., jailbreaking or rooting)
							may affect Application performance and security.
						</p>
					</CardContent>
				</Card>

				{/* Connectivity */}
				<Card>
					<CardHeader>
						<CardTitle>5. Network Connectivity</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground space-y-2">
						<p>
							Some features require an active internet connection. We are not
							responsible for limitations caused by network availability or
							third-party providers.
						</p>
						<p>
							You are responsible for any data or carrier charges incurred while
							using the Application.
						</p>
					</CardContent>
				</Card>

				{/* Updates */}
				<Card>
					<CardHeader>
						<CardTitle>6. Application Updates</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground space-y-2">
						<p>
							The Application may be updated periodically to improve
							performance, security, or functionality.
						</p>
						<p>
							Continued use may require installing updates. We may discontinue
							the Application at any time.
						</p>
					</CardContent>
				</Card>

				{/* Third Party */}
				<Card>
					<CardHeader>
						<CardTitle>7. Third-Party Services</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						<p>
							The Application relies on third-party services such as Google
							OAuth and backend infrastructure providers. We are not responsible
							for failures caused by these services.
						</p>
					</CardContent>
				</Card>

				{/* Liability */}
				<Card>
					<CardHeader>
						<CardTitle>8. Limitation of Liability</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						<p>
							To the maximum extent permitted by law, the Service Provider is
							not liable for indirect, incidental, or consequential damages,
							including data loss or service interruptions.
						</p>
					</CardContent>
				</Card>

				{/* Changes */}
				<Card>
					<CardHeader>
						<CardTitle>9. Changes to These Terms</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						<p>
							We may update these Terms periodically. Continued use of the
							Application after changes constitutes acceptance of the revised
							Terms.
						</p>
					</CardContent>
				</Card>

				{/* Footer */}
				<p className="text-center text-xs text-muted-foreground pt-6">
					© 2026 The Manager Life
				</p>
			</div>
		</main>
	);
};

export default TermsPage;
