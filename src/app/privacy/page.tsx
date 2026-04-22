import React from 'react';

const PrivacyPage = () => {
	return (
		<main className="px-6 py-12">
			<div className="max-w-3xl mx-auto space-y-10">
				<header className="space-y-2">
					<h1 className="text-4xl font-semibold tracking-tight">
						Privacy Policy
					</h1>
					<p className="text-muted-foreground text-sm">
						Effective date: December 8, 2025
					</p>
				</header>

				<section className="space-y-4 text-base leading-relaxed text-muted-foreground">
					<p>
						This Privacy Policy applies to The Manager Life mobile application
						(“Application”) provided by The Manager Life (“Service Provider”).
						The Application is provided as a free service and is intended for
						use as-is.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">
						Information Collection and Use
					</h2>

					<p className="text-muted-foreground">
						The Application collects certain information automatically when
						downloaded and used. This may include:
					</p>

					<ul className="list-disc list-inside text-muted-foreground space-y-1">
						<li>Device model</li>
						<li>IP address</li>
						<li>Pages visited within the Application</li>
						<li>Time and date of usage</li>
						<li>Total time spent in the Application</li>
						<li>Mobile operating system</li>
					</ul>

					<p className="text-muted-foreground">
						The Application does not collect precise location data.
					</p>

					<p className="text-muted-foreground">
						Approximate location information may be used for:
					</p>

					<ul className="list-disc list-inside text-muted-foreground space-y-1">
						<li>Providing location-aware features</li>
						<li>Improving product performance and analytics</li>
						<li>Enhancing service quality via trusted third-party tools</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Third-Party Access</h2>

					<p className="text-muted-foreground">
						Only aggregated, anonymized data may be shared with external
						services to help improve the Application.
					</p>

					<ul className="list-disc list-inside text-muted-foreground space-y-1">
						<li>When required by law</li>
						<li>To protect user safety and prevent fraud</li>
						<li>With trusted service providers supporting operations</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Opt-Out Rights</h2>

					<p className="text-muted-foreground">
						You may stop all information collection by uninstalling the
						Application using your device’s standard uninstall process.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Data Retention</h2>

					<p className="text-muted-foreground">
						Data is retained only while you actively use the Application and for
						a reasonable time afterward. To request deletion of your data,
						contact:
					</p>

					<p className="font-medium">admin@themanagerlife.com</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Children’s Privacy</h2>

					<p className="text-muted-foreground">
						The Application is not intended for children under age 13, and the
						Service Provider does not knowingly collect personal information
						from children.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Security</h2>

					<p className="text-muted-foreground">
						The Service Provider maintains physical, electronic, and procedural
						safeguards to protect user data.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Changes to This Policy</h2>

					<p className="text-muted-foreground">
						This Privacy Policy may be updated periodically. Continued use of
						the Application after updates indicates acceptance of the revised
						policy.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Your Consent</h2>

					<p className="text-muted-foreground">
						By using the Application, you consent to the collection and use of
						information as described in this Privacy Policy.
					</p>
				</section>
			</div>
		</main>
	);
};

export default PrivacyPage;
