'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';



type UserControlsProps = {
	showActiveOnly: boolean;
	setShowActiveOnly: (checked: boolean) => void;
	searchTerm: string;
	setSearchTerm: (value: string) => void;
};

export const UserControls: React.FC<UserControlsProps> = ({
	showActiveOnly,
	setShowActiveOnly,
	searchTerm,
	setSearchTerm,
}) => {
	
	return (
		<div className="flex flex-col md:flex-row justify-between items-center mx-auto w-3/4 bg-accent p-4 rounded-2xl">

			{/* Active Only Switch */}
			<div className="flex flex-row gap-2 items-center flex-1 min-w-[150px]">
				<label className="text-lg font-medium">Show Active Only</label>
				<Switch checked={showActiveOnly} onCheckedChange={setShowActiveOnly} />
			</div>

			{/* Search Input */}
			<div className="">
				<Input
					placeholder="Search by name or email"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="bg-background w-full sm:w-72 md:w-96"
				/>
			</div>

			
		</div>
	);
};

