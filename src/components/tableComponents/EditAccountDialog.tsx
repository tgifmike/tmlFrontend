'use client';

import { Account } from '@/app/types';
import { Icons } from '../icon';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { updateAccountName } from '@/app/api/accountApi';
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

type EditAccountProps = {
	account: Account;
	accounts?: Account[];
	onUpdate: (id: string, accountName: string) => void;
};

// ✅ Zod schema factory
const getSchema = (accounts: Account[] = [], currentAccountId: string) =>
	z.object({
		accountName: z
			.string()
			.min(1, 'Account name cannot be empty.')
			.refine(
				(name) =>
					!accounts.some(
						(a) =>
							a.accountName?.toLowerCase() === name.toLowerCase() &&
							a.id !== currentAccountId
					),
				{ message: 'Account name already exists' }
			),
	});

export function EditAccountDialog({
	account,
	accounts = [],
	onUpdate,
}: EditAccountProps) {
	const EditIcon = Icons.pencil;
	const [open, setOpen] = useState(false);

	// ✅ Dynamically recompute schema whenever accounts or current account changes
	const schema = useMemo(
		() => getSchema(accounts, account.id!),
		[accounts, account.id]
	);

	// ✅ Use the memoized schema here (NOT another getSchema() call)
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			accountName: account.accountName || '',
		},
	});

	const watchedValues = form.watch();
	const isChanged = watchedValues.accountName !== account.accountName;

	const onSubmit = async (values: z.infer<typeof schema>) => {
		// ✅ Double-check for duplicates before hitting API (optional safety)
		const duplicate = accounts.some(
			(a) =>
				a.accountName?.toLowerCase() === values.accountName.toLowerCase() &&
				a.id !== account.id
		);
		if (duplicate) {
			toast.error('Account name already exists');
			return;
		}

		try {
			const { error } = await updateAccountName(
				account.id!,
				values.accountName
			);
			if (error) {
				if (error.toLowerCase().includes('exists')) {
					toast.error('Account name already exists');
					return;
				}
				toast.error(error);
				return;
			}

			onUpdate(account.id!, values.accountName);
			setOpen(false);
			toast.success('Account name updated successfully');
		} catch {
			toast.error('Failed to update account name.');
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="text-chart-3">
					<EditIcon className="!w-[30px] !h-[30px]" />
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Account</DialogTitle>
					<DialogDescription>Update the account name</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="accountName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Account Name:</FormLabel>
									<FormControl>
										<Input placeholder="Account name" {...field} />
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
