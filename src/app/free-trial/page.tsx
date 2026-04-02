'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Zod schema
const formSchema = z.object({
	name: z.string().min(2, 'Name required'),
	restaurant: z.string().min(2, 'Restaurant/group name required'),
	email: z.string().email('Valid email required'),
	locations: z.number().min(1, 'Must be at least 1 location'),
	message: z.string().min(10, 'Please include rollout details'),
});

type FormValues = z.infer<typeof formSchema>;

export default function StartFreeTrialPage() {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [mounted, setMounted] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			restaurant: '',
			email: '',
			locations: 1,
			message: '',
		},
	});

	useEffect(() => {
		if (session?.user) {
			form.setValue('name', session.user.name || '');
			form.setValue('email', session.user.email || '');
		}
	}, [session, form]);

	useEffect(() => setMounted(true), []);

	if (!mounted)
		return (
			<section className="py-24 text-center text-muted-foreground">
				Loading form...
			</section>
		);

	async function onSubmit(values: FormValues) {
		setLoading(true);

		try {
			await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email/free-trial`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(values),
				},
			);

			setSuccess(true);
			form.reset();
		} catch (err) {
			console.error(err);
		}

		setLoading(false);
	}

	return (
		<section className="py-24">
			<div className="max-w-5xl mx-auto px-6">
				{/* Hero */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-14"
				>
					<h1 className="text-4xl md:text-5xl font-bold text-destructive">
						Start Your Free Trial
					</h1>
					<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
						Ready to get started? Fill out the form and our team will set you up
						with a free trial tailored to your restaurant or group.
					</p>
				</motion.div>

				{/* Form Card */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<Card className="shadow-xl rounded-2xl">
						<CardContent className="p-8 space-y-6">
							{success && (
								<p className="text-green-600">
									Thanks! We'll contact you shortly to get your free trial
									started.
								</p>
							)}

							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-6"
								>
									<div className="grid md:grid-cols-2 gap-6">
										{/* Name */}
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input placeholder="Your name" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										{/* Restaurant */}
										<FormField
											control={form.control}
											name="restaurant"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input
															placeholder="Restaurant / Group name"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										{/* Email */}
										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input
															type="email"
															placeholder="Work email"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										{/* Locations */}
										<FormField
											control={form.control}
											name="locations"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input
															type="number"
															min={1}
															step={1}
															{...field}
															value={field.value ?? ''}
															onChange={(e) =>
																field.onChange(Number(e.target.value))
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{/* Message */}
									<FormField
										control={form.control}
										name="message"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Textarea
														className="min-h-[140px]"
														placeholder="Tell us about your rollout timeline or requirements..."
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
										className="w-full text-lg"
										disabled={loading || !form.formState.isValid}
									>
										{loading ? 'Sending...' : 'Start Free Trial'}
									</Button>
								</form>
							</Form>
						</CardContent>
					</Card>
				</motion.div>

				{/* Footer reassurance */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
					className="text-center mt-12"
				>
					<p className="text-muted-foreground">
						Most restaurant groups are set up within a week. Our team will guide
						you every step of the way.
					</p>
				</motion.div>
			</div>
		</section>
	);
}
