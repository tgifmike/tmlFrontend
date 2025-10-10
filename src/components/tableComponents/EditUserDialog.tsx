'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import { User } from '@/app/types';
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from '@/components/ui/form';
import { updateUser } from '@/app/api/userApI';
import { Icons } from '../icon';

type Props = {
	user: User;
	users: User[];
	onUpdate: (id: string, name: string, email: string) => void;
};

export function EditUserDialog({ user, users, onUpdate }: Props) {
	const EditIcon = Icons.pencil;
	const [open, setOpen] = useState(false);

	// Zod schema with frontend duplicate checks
	  const schema = z
			.object({
				name: z.string().min(1, 'Name cannot be empty.'),
				email: z.string().email('Invalid email.'),
			})
			.superRefine((data, ctx) => {
				if (!users) return; // safety check

				const nameExists = users.some(
					(u) =>
						u.userName?.toLowerCase() === data.name.toLowerCase() &&
						u.id !== user.id
				);
				if (nameExists) {
					ctx.addIssue({
						code: 'custom',
						message: 'Name already exists',
						path: ['name'],
					});
				}

				const emailExists = users.some(
					(u) =>
						u.userEmail?.toLowerCase() === data.email.toLowerCase() &&
						u.id !== user.id
				);
				if (emailExists) {
					ctx.addIssue({
						code: 'custom',
						message: 'Email already exists',
						path: ['email'],
					});
				}
			});

		// const form = useForm<z.infer<typeof schema>>({
		// 	resolver: zodResolver(schema),
		// 	defaultValues: {
		// 		name: user.userName || '',
		// 		email: user.userEmail || '',
		// 	},
		// });

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: user.userName || '',
			email: user.userEmail || '',
		},
	});

	// Detect if form values changed from original
	const watchedValues = form.watch();
	const isChanged =
		watchedValues.name !== user.userName ||
		watchedValues.email !== user.userEmail;

	const onSubmit = async (values: z.infer<typeof schema>) => {
		try {
			await updateUser(user.id!, values);
			onUpdate(user.id!, values.name, values.email);
			setOpen(false);
			toast.success('User updated successfully');
		} catch (error: any) {
			const message =
				error?.response?.data?.message ||
				error?.message ||
				'Failed to update user';
			toast.error(message);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon">
					<EditIcon className="!w-[30px] !h-[30px]" />
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>
					<DialogDescription>Update Name and Email</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="User name" {...field} />
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
										<Input placeholder="User email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								disabled={!isChanged || form.formState.isSubmitting}
							>
								{form.formState.isSubmitting ? 'Saving…' : 'Save'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
