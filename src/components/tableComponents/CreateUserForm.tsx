'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';

import { createUser } from '@/app/api/userApI';
import { Icons } from '../../lib/icon';

const schema = z.object({
	userName: z.string().min(1, 'Name cannot be empty'),
	userEmail: z.string().email('Invalid email'),
});

type FormValues = z.infer<typeof schema>;

type Props = {
	onUserCreated?: (user: any) => void; // optional callback to update UI
};

export default function CreateUserDialog({ onUserCreated }: Props) {
	//icons
	const AddUserIcon = Icons.addUser;

	//set state
	const [open, setOpen] = useState(false);

	//form
	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			userName: '',
			userEmail: '',
		},
	});

	const onSubmit = async (values: FormValues) => {
		try {
			const created = await createUser(values);
			if (created) {
				toast.success(`User "${created.userName}" created successfully`);
				form.reset();
				setOpen(false);
				onUserCreated?.(created); // update parent UI if needed
			}
		} catch (error: any) {
			const message =
				error?.response?.data || error?.message || 'Failed to create user';
			toast.error(message);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size={'lg'}
					className="flex items-center gap-4 text-chart-3 font-bold text-lg"
				>
					<AddUserIcon className="!w-[25px] !h-[25px]" />
					Create User
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New User</DialogTitle>
					<DialogDescription>
						Enter name and email to create a new user
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="userName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="userEmail"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="Enter email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="submit" disabled={!form.formState.isValid}>
								Create
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
