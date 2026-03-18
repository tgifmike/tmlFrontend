'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Locations } from '@/app/types';
import { cloneStation } from '@/app/api/stationApi';
import { Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface CloneStationDialogProps {
	stationId: string;
	currentLocationId: string;
	currentAccountId: string
	userId: string;
	locations: Locations[]; // locations user has access to
	onCloneSuccess?: () => void; // optional callback after cloning
}

export const CloneStationDialog: React.FC<CloneStationDialogProps> = ({
	stationId,
	currentLocationId,
	currentAccountId,
	userId,
	locations,
	onCloneSuccess,
}) => {
	const [open, setOpen] = useState(false);
const [targetLocationId, setTargetLocationId] = useState<string | undefined>(
	undefined,
);
	const [overwrite, setOverwrite] = useState(false);
	const [loading, setLoading] = useState(false);

const filteredLocations = locations.filter(
	(loc) =>
		loc.id &&
		loc.id !== currentLocationId &&
		loc.accountId === currentAccountId,
);

	// Set default target location when locations change
useEffect(() => {
	const defaultLocation = filteredLocations[0];
	setTargetLocationId(defaultLocation?.id);
}, [filteredLocations]);

	

	const handleClone = async () => {
		if (!targetLocationId) {
			toast.error('Please select a target location.');
			return;
		}

		setLoading(true);
		try {
			console.log({
				stationId,
				targetLocationId,
				userId,
				overwrite,
			});
			// call API with overwrite flag
			await cloneStation(stationId, targetLocationId, userId, overwrite);
			toast.success('Station cloned successfully!');
			setOpen(false);
			onCloneSuccess?.();
		} catch (err: any) {
			toast.error('Failed to clone station: ' + (err?.message || err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{/* <DialogTrigger asChild> */}
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button variant="ghost" size="icon" className="text-chart-2">
							<Copy className="!w-[30px] !h-[30px]" />
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>Clone Station</TooltipContent>
			</Tooltip>
			{/* </DialogTrigger> */}

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Clone Station</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 mt-4">
					{/* Target Location */}
					<div>
						<Label htmlFor="targetLocation">Target Location</Label>
						<Select
							value={targetLocationId}
							onValueChange={(val) => setTargetLocationId(val)}
						>
							<SelectTrigger id="targetLocation">
								<SelectValue placeholder="Select Location" />
							</SelectTrigger>
							<SelectContent>
								{filteredLocations.length > 0 ? (
									filteredLocations.map((loc) => (
										<SelectItem key={loc.id} value={loc.id}>
											{loc.locationName}
										</SelectItem>
									))
								) : (
									<div className="p-2 text-sm text-muted-foreground">
										No other locations in this account to clone to.
									</div>
								)}
							</SelectContent>
						</Select>
					</div>

					{/* Overwrite Existing */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="overwrite"
							checked={overwrite}
							onCheckedChange={(checked) => setOverwrite(Boolean(checked))}
						/>
						<Label htmlFor="overwrite">Overwrite existing stations</Label>
					</div>
				</div>

				<DialogFooter>
					<Button
						onClick={handleClone}
						disabled={loading || filteredLocations.length === 0}
					>
						{loading ? 'Cloning…' : 'Clone'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
