import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
	title: 'Privacy Policy | The Manager Life',
	description:
		'How The Manager Life handles user data and Google OAuth information.',
};

export default function PrivacyPolicyPage() {
	return (
		<main className="min-h-screen bg-background py-16 px-6">
			<div className="max-w-3xl mx-auto space-y-6">
				{/* Header */}
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
					<p className="text-muted-foreground">
						Effective Date: April 29, 2026
					</p>
				</div>

				{/* Sections */}
				<Card>
					<CardHeader>
						<CardTitle>1. Information We Collect</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground space-y-2">
						<p>
							When you sign in using Google OAuth (via NextAuth), we may receive
							basic account information including your name, email address,
							profile image, and Google user ID.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>2. How We Use Your Information</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						<p>
							We use this information strictly for authentication, account
							creation, and maintaining user sessions. We do not use Google user
							data for advertising, marketing, profiling, or automated
							decision-making.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>3. Data Storage</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						<p>
							We store only the minimum required user data needed to operate the
							application. Authentication is managed using secure tokens via
							NextAuth and our backend service.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>4. Data Sharing</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						<p>
							We do not sell, rent, or share your personal data or Google user
							data with third parties.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>5. Data Deletion</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						<p>
							You may request deletion of your account and associated data at
							any time by contacting{' '}
							<span className="font-medium text-foreground">
								admin@themanagerlife.com
							</span>
							.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>6. Security</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						<p>
							We use secure authentication (NextAuth + Spring Boot), HTTPS
							encryption, and restricted database access to protect your data.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>7. Third-Party Services</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						<p>We use Google OAuth only for authentication purposes.</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>8. Changes</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						<p>
							This policy may be updated periodically. Continued use of the
							application indicates acceptance of changes.
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
}
