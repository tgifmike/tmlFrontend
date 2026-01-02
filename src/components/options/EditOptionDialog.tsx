'use client';

import React, { useState, useEffect } from 'react';
import { OptionEntity, OptionType, OptionTypeLabels, User } from '@/app/types';
import { updateOption } from '@/app/api/optionsApi';
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
import { Icons } from '@/lib/icon';
import { Switch } from '../ui/switch';

interface EditOptionDialogProps {
	option: OptionEntity;
	currentUser?: User;
	onOptionUpdated: (option: OptionEntity) => void;
}

export const EditOptionDialog: React.FC<EditOptionDialogProps> = ({
	option,
	currentUser,
	onOptionUpdated,
}) => {
	const [open, setOpen] = useState(false);
	const [optionName, setOptionName] = useState(option.optionName);
	const [optionActive, setOptionActive] = useState(option.optionActive);
	const [optionType, setOptionType] = useState<OptionType | undefined>(
		option.optionType
	);
	const [loading, setLoading] = useState(false);

	const EditIcon = Icons.pencil;

	// Get the logged-in user from window.sessionUser
	// const currentUser = (typeof window !== 'undefined' &&
	// 	(window as any).sessionUser) as User;

	useEffect(() => {
		if (open) {
			setOptionName(option.optionName);
			setOptionActive(option.optionActive);
			setOptionType(option.optionType);
		}
	}, [open, option]);

	const handleUpdate = async () => {
		if (!optionName.trim()) {
			toast.error('Option name is required.');
			return;
		}
		if (!optionType) {
			toast.error('Option type is required.');
			return;
		}
		if (!currentUser?.id) {
			toast.error('User not found. Please log in again.');
			return;
		}

		setLoading(true);
		try {
			// updateOption now returns the OptionEntity directly
			const updatedOption = await updateOption(
				option.id!,
				{
					optionName,
					optionActive,
					optionType,
				},
				currentUser.id
			);

			// Pass raw OptionEntity to callback
			onOptionUpdated(updatedOption); // ✅ use updatedOption, not updated.data

			toast.success('Option updated.');
			setOpen(false);
		} catch (err: any) {
			toast.error(err?.message || 'Failed to update option.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="text-chart-3">
					<EditIcon className="!w-[30px] !h-[30px]" />
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-[425px] bg-accent">
				<DialogHeader>
					<DialogTitle>Edit Option</DialogTitle>
					<DialogDescription>
						Update the option details below.
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

					<div className="flex justify-between items-center">
						<label>Option Type</label>
						<Select
							value={optionType} // the enum value (OptionType)
							onValueChange={(val) => setOptionType(val as OptionType)} // cast back to OptionType
						>
							<SelectTrigger>
								<SelectValue placeholder="Select option type" />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(OptionTypeLabels).map(([key, label]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center gap-4">
						<Switch
							checked={optionActive}
							onCheckedChange={(checked) => setOptionActive(checked)}
						/>
						<span>{optionActive ? 'Active' : 'Inactive'}</span>
					</div>

					<Button onClick={handleUpdate} disabled={loading}>
						{loading ? 'Updating…' : 'Update Option'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
