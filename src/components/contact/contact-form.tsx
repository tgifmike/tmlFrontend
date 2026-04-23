'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';


import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth/useSession';

// Zod schema
const formSchema = z.object({
	name: z.string().min(2, 'Name required'),
	email: z.string().email('Invalid email'),
	message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactForm() {
	const { user } = useSession();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: user?.name || '',
			email: user?.email || '',
			message: '',
		},
	});

	// Prefill if session exists
	useEffect(() => {
		if (user) {
			form.setValue('name', user.name || '');
			form.setValue('email', user.email || '');
		}
	}, [user, form]);

	async function onSubmit(values: FormValues) {
		setLoading(true);

		try {
			await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email/contact`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values), // matches backend DTO: { name, email, message }
			});

			setSuccess(true);
			form.reset();
		} catch (err) {
			console.error(err);
		}

		setLoading(false);
	}

	return (
		<div className="max-w-xl mx-auto">
			<Card className="shadow-xl rounded-2xl">
				<CardTitle className="text-2xl font-semibold text-center">
					Send us a message
				</CardTitle>
				<CardContent className="p-8">
					{success && (
						<p className="text-green-600 mb-6">
							Thanks! We'll get back to you shortly.
						</p>
					)}

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder="Your name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="you@email.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="message"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Message</FormLabel>
										<FormControl>
											<Textarea
												rows={5}
												placeholder="Your message..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								className="w-full"
								disabled={loading || !form.formState.isValid}
							>
								{loading ? 'Sending...' : 'Send Message'}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
