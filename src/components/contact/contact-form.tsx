'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';

import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

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
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useSession } from '@/lib/auth/session-context';


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
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
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
		setSuccess(false);
		setSubmitError(null);

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email/contact`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values), // matches backend DTO: { name, email, message }
			});
			if (!response.ok) throw new Error('Message could not be sent.');

			setSuccess(true);
			form.reset();
		} catch (error) {
			console.error(error);
			setSubmitError('We could not send your message. Please try again shortly.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="w-full max-w-xl lg:justify-self-end">
			<Card className="gap-0 overflow-hidden rounded-3xl py-0 shadow-xl">
				<CardHeader className="border-b bg-muted/30 px-6 py-6 sm:px-8">
					<CardTitle className="text-2xl tracking-tight">Send us a message</CardTitle>
					<CardDescription className="mt-1 leading-6">
						Share a little context so we can give you a useful answer.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6 sm:p-8">
					{success && (
						<div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
							<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
							<p>Thanks! Your message was sent, and we’ll get back to you shortly.</p>
						</div>
					)}

					{submitError && (
						<div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
							<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
							<p>{submitError}</p>
						</div>
					)}

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
								<FormItem>
									<FormLabel>Your name</FormLabel>
									<FormControl>
										<Input autoComplete="name" placeholder="Alex Morgan" {...field} />
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
									<FormLabel>Work email</FormLabel>
									<FormControl>
										<Input
											type="email"
											autoComplete="email"
											placeholder="alex@restaurant.com"
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
									<FormLabel>How can we help?</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-36 resize-y"
											placeholder="Tell us about your restaurant, current line-check process, or question..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								size="lg"
								className="w-full"
								disabled={loading || !form.formState.isValid}
							>
								{loading ? 'Sending…' : 'Send Message'}
								{!loading && <Send aria-hidden="true" />}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
