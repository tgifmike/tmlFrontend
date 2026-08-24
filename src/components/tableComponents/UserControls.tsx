'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';



type UserControlsProps = {
	showActiveOnly: boolean;
	setShowActiveOnly: (checked: boolean) => void;
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	searchPlaceholder?: string;
};

export const UserControls: React.FC<UserControlsProps> = ({
	showActiveOnly,
	setShowActiveOnly,
	searchTerm,
	setSearchTerm,
	searchPlaceholder = 'Search',
}) => {
	const activeOnlyId = React.useId();
	
	return (
		<div className="mx-auto flex w-full flex-col items-center justify-between gap-4 rounded-2xl border bg-muted/50 px-4 py-4 sm:px-6 md:flex-row">
			
			{/* Search Input */}
			<div className="w-full md:max-w-sm">
				<Input
					placeholder={searchPlaceholder}
					aria-label={searchPlaceholder}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="rounded-full bg-background"
				/>
			</div>

			{/* Active Only Switch */}
			<div className="flex w-full flex-row items-center justify-between gap-3 md:w-auto md:justify-end">
				<label htmlFor={activeOnlyId} className="text-sm font-medium sm:text-base">
					Show active only
				</label>
				<Switch
					id={activeOnlyId}
					checked={showActiveOnly}
					onCheckedChange={setShowActiveOnly}
				/>
			</div>
		</div>
	);
};
