import React from 'react';

const TermsPage = () => {
	return (
		<main className="px-6 py-12">
			<div className="max-w-3xl mx-auto space-y-10">
				<header className="space-y-2">
					<h1 className="text-4xl font-semibold tracking-tight">
						Terms & Conditions
					</h1>
					<p className="text-muted-foreground text-sm">
						Effective date: December 8, 2025
					</p>
				</header>

				<section className="space-y-4 text-base leading-relaxed text-muted-foreground">
					<p>
						These Terms & Conditions apply to The Manager Life mobile
						application (“Application”) provided by The Manager Life (“Service
						Provider”). By downloading or using the Application, you agree to
						the terms outlined below.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Intellectual Property</h2>

					<p className="text-muted-foreground">
						Unauthorized copying, modification, translation, reverse
						engineering, or derivative works based on the Application are
						strictly prohibited. All trademarks, copyrights, database rights,
						and intellectual property remain the property of the Service
						Provider.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">
						Service Availability & Changes
					</h2>

					<p className="text-muted-foreground">
						The Service Provider may update, modify, or discontinue features of
						the Application at any time. If charges are introduced in the
						future, they will be clearly communicated beforehand.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Device Responsibility</h2>

					<p className="text-muted-foreground">
						You are responsible for maintaining the security of your device and
						access to the Application. Jailbreaking or rooting your device may
						compromise functionality and security and is not recommended.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Network Connectivity</h2>

					<p className="text-muted-foreground">
						Some Application features require an active internet connection. The
						Service Provider is not responsible for reduced functionality caused
						by connectivity limitations or data restrictions imposed by your
						mobile provider.
					</p>

					<p className="text-muted-foreground">
						You remain responsible for any data charges incurred while using the
						Application, including roaming charges where applicable.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Application Updates</h2>

					<p className="text-muted-foreground">
						The Application may be updated periodically to maintain performance
						and compatibility. Continued use may require installing updates
						provided through your platform’s app marketplace.
					</p>

					<p className="text-muted-foreground">
						The Service Provider reserves the right to discontinue the
						Application at any time without prior notice. Upon termination, your
						rights to use the Application will end and you must stop using it.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Third-Party Dependencies</h2>

					<p className="text-muted-foreground">
						Some functionality depends on third-party services. The Service
						Provider is not liable for losses resulting from reliance on data
						supplied by those services.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Changes to These Terms</h2>

					<p className="text-muted-foreground">
						These Terms & Conditions may be updated periodically. Continued use
						of the Application after updates indicates acceptance of the revised
						terms.
					</p>
				</section>
			</div>
		</main>
	);
};

export default TermsPage;
