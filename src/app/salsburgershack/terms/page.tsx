import type { Metadata } from 'next';

import LegalPage from '../_components/LegalPage';

export const metadata: Metadata = {
	title: 'Terms of Use',
	description: "Terms of Use for the Sal's Burger Shack game app.",
	alternates: {
		canonical: '/salsburgershack/terms',
	},
};

export default function SalsBurgerShackTermsPage() {
	return (
		<LegalPage
			eyebrow="The rules of the game"
			title="Terms of Use"
			intro="These terms govern your download and use of the Sal's Burger Shack game. By installing or playing the game, you agree to them."
			otherPage={{
				href: '/salsburgershack/privacy',
				label: 'Read the Privacy Policy',
			}}
			sections={[
				{
					title: 'License to play',
					content: (
						<p>
							You receive a personal, limited, non-exclusive, non-transferable, and
							revocable license to install and use the game for private,
							non-commercial entertainment, subject to these terms and the rules of
							the platform from which you downloaded it.
						</p>
					),
				},
				{
					title: 'Acceptable use',
					content: (
						<p>
							You may not copy, distribute, sell, rent, exploit, interfere with, or
							attempt to gain unauthorized access to the game or its services. You
							may not use cheats, automation, modified clients, or other methods that
							disrupt fair play or normal operation.
						</p>
					),
				},
				{
					title: 'Ownership',
					content: (
						<p>
							The game, including its name, characters, artwork, audio, software,
							gameplay content, and other materials, is owned by or licensed to the
							game&apos;s developer. These terms do not transfer ownership of any part of
							the game to you.
						</p>
					),
				},
				{
					title: 'Virtual items and purchases',
					content: (
						<p>
							If virtual items or paid features are offered, they provide a limited
							license for use within the game and have no real-world cash value.
							Payments, refunds, and billing disputes are also subject to the rules
							of the app store or platform that processed the transaction.
						</p>
					),
				},
				{
					title: 'Updates and availability',
					content: (
						<p>
							The game may be patched, changed, suspended, or discontinued at any
							time. Features, content, requirements, and compatibility may change.
							Continued use may require you to install an update.
						</p>
					),
				},
				{
					title: 'Disclaimer',
					content: (
						<p>
							To the fullest extent permitted by law, the game is provided “as is”
							and “as available,” without warranties of uninterrupted operation,
							error-free performance, compatibility, or fitness for a particular
							purpose. Your statutory consumer rights are not excluded.
						</p>
					),
				},
				{
					title: 'Limitation of liability',
					content: (
						<p>
							To the fullest extent permitted by law, the developer is not liable
							for indirect, incidental, special, or consequential loss arising from
							your use of or inability to use the game. Nothing in these terms limits
							liability that cannot legally be limited.
						</p>
					),
				},
				{
					title: 'Termination',
					content: (
						<p>
							Your license ends if you materially violate these terms. You may stop
							using the game at any time by uninstalling it. Provisions concerning
							ownership, disclaimers, and liability survive termination where
							applicable.
						</p>
					),
				},
				{
					title: 'Changes and contact',
					content: (
						<>
							<p>
								These terms may be revised as the game changes. The effective date
								above identifies the current version.
							</p>
							<p>
								For questions about these terms, email{' '}
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
