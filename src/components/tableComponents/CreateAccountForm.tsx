'use client';

import { createAccount } from '@/app/api/accountApi';
import { Account } from '@/app/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { DialogDescription } from '@radix-ui/react-dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Icons } from '../../lib/icon';

type CreateAccountDialogProps = {
	onAccountCreated?: (account: Account) => void;
	existingAccounts?: Account[];
};

// ✅ dynamic schema that checks for duplicates
const getSchema = (accounts: Account[] = []) =>
	z.object({
		accountName: z
			.string()
			.min(1, 'Account name cannot be empty')
			.refine(
				(name) =>
					!accounts.some(
						(a) => a.accountName.toLowerCase() === name.toLowerCase()
					),
				{ message: 'Account name already exists' }
			),
	});

export default function CreateAccountDialog({
	onAccountCreated,
	existingAccounts = [],
}: CreateAccountDialogProps) {
    
    //icons
    const AddAccountIcon = Icons.addAccount;

    //set state
    const [open, setOpen] = useState(false);
    

	// dynamically revalidate when account list changes
	const schema = useMemo(() => getSchema(existingAccounts), [existingAccounts]);

	type FormValues = z.infer<typeof schema>;

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { accountName: '' },
		mode: 'onChange',
	});

	const onSubmit = async (values: FormValues) => {
		try {
			const { data, error } = await createAccount(values);

			if (error || !data) {
				if (error?.includes('409') || error?.toLowerCase().includes('exists')) {
					toast.error('Account name already exists.');
				} else {
					toast.error('Failed to create account.');
				}
				return;
			}

			toast.success(`Account "${data.accountName}" created successfully`);
			form.reset();
			setOpen(false);
			onAccountCreated?.(data);
		} catch (error: any) {
			const message =
				error?.response?.data?.message ||
				error?.message ||
				'Failed to Create Account';
			toast.error(message);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="lg"
					className="text-chart-3 text-lg font-bold"
				>
					<AddAccountIcon className="!w-[25px] !h-[25px]" />
					Create Account
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Account</DialogTitle>
					<DialogDescription>
						Enter a unique name to create a new account.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="accountName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Account Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter Account Name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="submit"
								disabled={
									!form.formState.isValid || form.formState.isSubmitting
								}
							>
								{form.formState.isSubmitting ? 'Creating…' : 'Create Account'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
