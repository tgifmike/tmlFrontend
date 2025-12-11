'use client';

import React, { useState } from 'react';
import { OptionEntity, OptionType, User } from '@/app/types';
import { createOption } from '@/app/api/optionsApi';
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface CreateOptionDialogProps {
	accountId: string;
	currentUser: User;
	onOptionCreated: (option: OptionEntity) => void;
}

export const CreateOptionDialog: React.FC<CreateOptionDialogProps> = ({
	accountId,
	currentUser,
	onOptionCreated,
}) => {
	const [open, setOpen] = useState(false);
	const [optionName, setOptionName] = useState('');
	const [optionActive, setOptionActive] = useState(true);
	const [optionType, setOptionType] = useState<OptionType>(OptionType.TOOL);
	const [loading, setLoading] = useState(false);

	const handleCreate = async () => {
		if (!currentUser?.id) {
			toast.error('User not logged in.');
			return;
		}

		if (!optionName.trim()) {
			toast.error('Option name is required.');
			return;
		}

		setLoading(true);
		try {
			const created: OptionEntity = await createOption(
				{ optionName, optionActive, optionType, accountId },
				currentUser.id
			);

			onOptionCreated(created);

			// Reset form
			setOptionName('');
			setOptionActive(true);
			setOptionType(OptionType.TOOL);
			setOpen(false);
			toast.success('Option saved successfully!');
		} catch (err: any) {
			toast.error(
				err?.response?.data?.message ||
					err.message ||
					'Failed to create option.'
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Create Option</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Option</DialogTitle>
					<DialogDescription>
						Fill in the details below to create a new option.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<label>Option Name</label>
						<Input
							value={optionName}
							onChange={(e) => setOptionName(e.target.value)}
							placeholder="Enter option name"
						/>
					</div>

					<div className="grid gap-2">
						<label>Option Type</label>
						<Select
							value={optionType}
							onValueChange={(val) => setOptionType(val as OptionType)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select option type" />
							</SelectTrigger>
							<SelectContent>
								{Object.values(OptionType).map((type) => (
									<SelectItem key={type} value={type}>
										{type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<label>Status</label>
						<select
							value={optionActive ? 'active' : 'inactive'}
							onChange={(e) => setOptionActive(e.target.value === 'active')}
						>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
						</select>
					</div>

					<Button onClick={handleCreate} disabled={loading}>
						{loading ? 'Creating…' : 'Create Option'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
