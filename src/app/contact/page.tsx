import ContactForm from '@/components/contact/contact-form';
import React from 'react'

const ContactPage = () => {
  return (
		<section className="py-24">
			<div className="max-w-4xl mx-auto px-6">
				<h1 className="text-4xl font-bold text-center mb-10">Contact Us</h1>

				<ContactForm />
			</div>
		</section>
	);
}

export default ContactPage