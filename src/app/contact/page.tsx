import ContactForm from '@/components/contact/contact-form';

export default function ContactPage() {
	return (
		<section className="py-24">
			<div className="max-w-5xl mx-auto px-6">
				<div className="text-center mb-14">
					<h1 className="text-4xl md:text-5xl font-bold text-destructive">
						Contact Us
					</h1>

					<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
						Have a question about the app, need help getting started, or just
						want to learn more? Send us a message and we’ll get back to you
						shortly.
					</p>
				</div>

				<ContactForm />

				<p className="text-center text-muted-foreground mt-10">
					We typically respond within one business day.
				</p>
			</div>
		</section>
	);
}
