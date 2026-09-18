import type { Metadata } from 'next';

import LegalPage from '../_components/LegalPage';

export const metadata: Metadata = {
	title: 'Privacy Policy',
	description: "Privacy Policy for the Sal's Burger Shack game app.",
	alternates: {
		canonical: '/salsburgershack/privacy',
	},
};

export default function SalsBurgerShackPrivacyPage() {
	return (
		<LegalPage
			eyebrow="Your data, explained simply"
			title="Privacy Policy"
			intro="This policy explains what information the Sal's Burger Shack game uses, where that information lives, and the choices available to you."
			otherPage={{
				href: '/salsburgershack/terms',
				label: 'Read the Terms of Use',
			}}
			sections={[
				{
					title: 'Information we collect',
					content: (
						<>
							<p>
								Sal&apos;s Burger Shack does not require you to create an account and
								does not directly collect your name, email address, contacts,
								precise location, photos, or other personally identifying information.
							</p>
							<p>
								The game may save progress, achievements, preferences, and settings
								locally on your device. This information is used only to provide game
								functionality.
							</p>
						</>
					),
				},
				{
					title: 'Platform and diagnostic information',
					content: (
						<p>
							The store or platform through which you download the game may process
							technical information such as device type, operating-system version,
							crash reports, general region, and download or purchase history. That
							processing is controlled by the platform provider and is subject to
							its privacy policy and your device settings.
						</p>
					),
				},
				{
					title: 'Advertising and tracking',
					content: (
						<p>
							The game does not use targeted advertising, sell personal information,
							or track you across apps or websites owned by other companies. If a
							future version changes these practices, this policy will be updated
							before those changes take effect.
						</p>
					),
				},
				{
					title: 'Purchases',
					content: (
						<p>
							If optional purchases become available, they will be processed by the
							app store or platform provider. Sal&apos;s Burger Shack does not receive or
							store your complete payment-card information.
						</p>
					),
				},
				{
					title: 'Data retention and deletion',
					content: (
						<p>
							Locally saved game data remains on your device until you reset the
							game, clear its storage, or uninstall it. Information held by an app
							store or platform is retained according to that provider&apos;s policies
							and account controls.
						</p>
					),
				},
				{
					title: "Children's privacy",
					content: (
						<p>
							The game does not knowingly collect personal information from children.
							A parent or guardian who believes a child has provided personal
							information should use the support contact shown on the game&apos;s app-store
							listing.
						</p>
					),
				},
				{
					title: 'Changes and contact',
					content: (
						<>
							<p>
								This policy may be updated when the game or legal requirements change.
								The effective date above will identify the latest version.
							</p>
							<p>
								For privacy questions or requests, email{' '}
								<a
									href="mailto:admin@themanagerlife.com"
									className="font-bold text-[#a93820] underline decoration-2 underline-offset-4"
								>
									admin@themanagerlife.com
								</a>
								.
							</p>
						</>
					),
				},
			]}
		/>
	);
}
