'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { GrUserAdmin } from 'react-icons/gr';
import { createPinEmployee } from '@/app/api/userApI';
import { getLocationsByAccountId } from '@/app/api/locationApi';
import type { User } from '@/app/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export function CreatePinEmployeeDialog({ accountId, onUserCreated }: { accountId: string; onUserCreated: (user: User) => void }) {
	const [open, setOpen] = useState(false);
	const [userName, setUserName] = useState('');
	const [saving, setSaving] = useState(false);
	const [locations, setLocations] = useState<{ id?: string; locationName: string }[]>([]);
	const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
	const [loadingLocations, setLoadingLocations] = useState(false);

	const handleOpenChange = async (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) return;
		setLoadingLocations(true);
		const response = await getLocationsByAccountId(accountId);
		setLocations(response.data ?? []);
		setLoadingLocations(false);
	};

	const create = async () => {
		const name = userName.trim();
		if (!name) return toast.error('Employee name is required.');
		if (selectedLocationIds.length === 0) return toast.error('Select at least one location.');
		setSaving(true);
		try {
			const response = await createPinEmployee(accountId, name, selectedLocationIds);
			if (response.error) throw new Error(response.error);
			if (!response.data) throw new Error('The server did not return the new employee.');
			onUserCreated(response.data);
			toast.success(`${name} was added as a PIN-only employee.`);
			setUserName('');
			setSelectedLocationIds([]);
			setOpen(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to create employee.');
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" className="h-10 rounded-xl px-4 text-sm font-bold text-chart-3">
					{/* <UserPlus className="mr-2 size-5" /> <GrUserAdmin /> */}
					<GrUserAdmin className="size-5" />
					<span className="hidden sm:inline">Create PIN user</span>
					<span className="sm:hidden">Create PIN user</span>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create line-check employee</DialogTitle>
					<DialogDescription>
						This employee will use a PIN on the iPad and will not receive an
						OAuth invitation or full web access.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-2">
					<label htmlFor="pin-employee-name" className="text-sm font-medium">
						Employee name
					</label>
					<Input
						id="pin-employee-name"
						placeholder="e.g. Alex Johnson"
						value={userName}
						onChange={(event) => setUserName(event.target.value)}
						autoFocus
					/>
				</div>
				<div className="space-y-2">
					<p className="text-sm font-medium">Location access</p>
					<p className="text-xs text-muted-foreground">
						Select one or more locations where this employee can complete line
						checks.
					</p>
					<div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border p-3">
						{loadingLocations ? (
							<p className="text-sm text-muted-foreground">
								Loading locations…
							</p>
						) : locations.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No locations found for this account.
							</p>
						) : (
							locations.map(
								(location) =>
									location.id && (
										<label
											key={location.id}
											className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-muted"
										>
											<Checkbox
												checked={selectedLocationIds.includes(location.id)}
												onCheckedChange={(checked) =>
													setSelectedLocationIds((current) =>
														checked
															? [...current, location.id!]
															: current.filter((id) => id !== location.id),
													)
												}
											/>
											<span>{location.locationName}</span>
										</label>
									),
							)
						)}
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button onClick={create} disabled={saving}>
						{saving ? 'Creating…' : 'Create employee'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
