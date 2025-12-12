'use client';

import React, { useState, useEffect } from 'react';
import { OptionEntity, OptionType, User } from '@/app/types';
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

interface EditOptionDialogProps {
	option: OptionEntity;
	onOptionUpdated: (option: OptionEntity) => void;
}

export const EditOptionDialog: React.FC<EditOptionDialogProps> = ({
	option,
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

	const currentUser = (typeof window !== 'undefined' &&
		(window as any).sessionUser) as User;

	useEffect(() => {
		// reset fields whenever the dialog opens
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

		setLoading(true);
		try {
			const updated = await updateOption(
				option.id!,
				{
					optionName,
					optionActive,
					optionType,
					updatedBy: currentUser?.id!,
				},
				option.account?.id! // <-- accountId is needed
			);


			if (updated.data) {
				onOptionUpdated(updated.data);
				toast.success('Option updated.');
				setOpen(false);
			} else {
				toast.error('Failed to update option.');
			}
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
			<DialogContent className="sm:max-w-[425px]">
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

					<Button onClick={handleUpdate} disabled={loading}>
						{loading ? 'Updating…' : 'Update Option'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
