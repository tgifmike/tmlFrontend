'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, MapPin, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import {
	getAccountsForUser,
	getAllAccounts,
	grantAccess,
	revokeAccess,
} from '@/app/api/accountApi';
import {
	getAllLocations,
	getUserLocationAccess,
	grantLocationAccess,
	revokeLocationAccess,
} from '@/app/api/locationApi';
import { getAllUsers } from '@/app/api/userApI';
import { Account, Locations, User } from '@/app/types';
import Spinner from '@/components/spinner/Spinner';
import { Pagination } from '@/components/tableComponents/Pagination';
import { UserControls } from '@/components/tableComponents/UserControls';
import {
	UserInvitationStatus,
} from '@/components/tableComponents/UserInvitationStatus';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

type AccessMap = Record<string, string[]>;
type DialogMode = 'accounts' | 'locations';
type RequestResult = { error?: string };

export default function UserAccessPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [userAccess, setUserAccess] = useState<AccessMap>({});
	const [userLocationAccess, setUserLocationAccess] = useState<AccessMap>({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [searchTerm, setSearchTerm] = useState('');
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	useEffect(() => {
		let cancelled = false;

		const loadData = async () => {
			setLoading(true);
			try {
				const [userRes, accountRes, locationRes] = await Promise.all([
					getAllUsers(),
					getAllAccounts(),
					getAllLocations(),
				]);

				if (userRes.error) throw new Error(userRes.error);
				if (accountRes.error) throw new Error(accountRes.error);
				if (locationRes.error) throw new Error(locationRes.error);

				const loadedUsers = userRes.data ?? [];
				const loadedAccounts = accountRes.data ?? [];
				const loadedLocations = locationRes.data ?? [];

				const accessEntries = await Promise.all(
					loadedUsers.map(async (user) => {
						if (!user.id) return null;
						const [accountsForUser, locationsForUser] = await Promise.all([
							getAccountsForUser(user.id),
							getUserLocationAccess(user.id),
						]);

						if (accountsForUser.error) throw new Error(accountsForUser.error);
						if (locationsForUser.error) throw new Error(locationsForUser.error);

						return {
							userId: user.id,
							accountIds: compactIds(accountsForUser.data ?? []),
							locationIds: compactIds(locationsForUser.data ?? []),
						};
					}),
				);

				if (cancelled) return;

				const accountMap: AccessMap = {};
				const locationMap: AccessMap = {};
				for (const entry of accessEntries) {
					if (!entry) continue;
					accountMap[entry.userId] = entry.accountIds;
					locationMap[entry.userId] = entry.locationIds;
				}

				setUsers(loadedUsers);
				setAccounts(loadedAccounts);
				setLocations(loadedLocations);
				setUserAccess(accountMap);
				setUserLocationAccess(locationMap);
			} catch (error) {
				if (!cancelled) {
					toast.error(
						error instanceof Error
							? error.message
							: 'Failed to load user access.',
					);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		loadData();
		return () => {
			cancelled = true;
		};
	}, []);

	const filteredUsers = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase();
		return users.filter((user) => {
			const matchesSearch =
				!normalizedSearch ||
				(user.userName ?? '').toLowerCase().includes(normalizedSearch) ||
				(user.userEmail ?? '').toLowerCase().includes(normalizedSearch);
			const matchesStatus = !showActiveOnly || user.userActive === true;
			return matchesSearch && matchesStatus;
		});
	}, [users, searchTerm, showActiveOnly]);

	const paginatedUsers = filteredUsers.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, showActiveOnly, pageSize]);

	useEffect(() => {
		const lastPage = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
		if (currentPage > lastPage) setCurrentPage(lastPage);
	}, [currentPage, filteredUsers.length, pageSize]);

	const openAccessDialog = (user: User, mode: DialogMode) => {
		if (!user.id) return;
		setSelectedUser(user);
		setDialogMode(mode);
		setSelectedIds(
			mode === 'accounts'
				? userAccess[user.id] ?? []
				: userLocationAccess[user.id] ?? [],
		);
	};

	const closeAccessDialog = (force = false) => {
		if (saving && !force) return;
		setDialogMode(null);
		setSelectedUser(null);
		setSelectedIds([]);
	};

	const resources = useMemo(() => {
		if (dialogMode === 'accounts') {
			return accounts.flatMap((account) =>
				account.id
					? [
							{
								id: account.id,
								name: account.accountName,
								description: account.accountActive ? 'Active account' : 'Inactive account',
							},
						]
					: [],
			);
		}

		if (dialogMode === 'locations') {
			return locations.flatMap((location) =>
				location.id
					? [
							{
								id: location.id,
								name: location.locationName,
								description: formatLocation(location),
							},
						]
					: [],
			);
		}

		return [];
	}, [accounts, dialogMode, locations]);

	const previousIds =
		selectedUser?.id && dialogMode
			? dialogMode === 'accounts'
				? userAccess[selectedUser.id] ?? []
				: userLocationAccess[selectedUser.id] ?? []
			: [];
	const hasChanges = !sameIds(previousIds, selectedIds);

	const toggleResource = (resourceId: string) => {
		setSelectedIds((previous) =>
			previous.includes(resourceId)
				? previous.filter((id) => id !== resourceId)
				: [...previous, resourceId],
		);
	};

	const saveAccess = async () => {
		if (!selectedUser?.id || !dialogMode) return;

		const userId = selectedUser.id;
		const toGrant = selectedIds.filter((id) => !previousIds.includes(id));
		const toRevoke = previousIds.filter((id) => !selectedIds.includes(id));
		setSaving(true);

		try {
			const results =
				dialogMode === 'accounts'
					? await Promise.all([
							...toGrant.map((id) => grantAccess(userId, id)),
							...toRevoke.map((id) => revokeAccess(userId, id)),
						])
					: await Promise.all([
							...toGrant.map((id) => grantLocationAccess(userId, id)),
							...toRevoke.map((id) => revokeLocationAccess(userId, id)),
						]);

			assertSuccessful(results);

			if (dialogMode === 'accounts') {
				setUserAccess((previous) => ({
					...previous,
					[userId]: [...selectedIds],
				}));

				const refreshedLocations = await getUserLocationAccess(userId);
				if (!refreshedLocations.error) {
					setUserLocationAccess((previous) => ({
						...previous,
						[userId]: compactIds(refreshedLocations.data ?? []),
					}));
				}
			} else {
				setUserLocationAccess((previous) => ({
					...previous,
					[userId]: [...selectedIds],
				}));
			}

			toast.success(
				`${dialogMode === 'accounts' ? 'Account' : 'Location'} access updated for ${displayName(selectedUser)}.`,
			);
			closeAccessDialog(true);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to update access.',
			);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-40 text-xl text-chart-3">
				<Spinner />
				<span className="ml-4">Loading user access…</span>
			</div>
		);
	}

	return (
		<main className="min-h-screen p-4 sm:p-6">
			<div className="mx-auto w-full max-w-7xl">
				<header className="mb-6 flex items-start gap-4">
					<span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-chart-3/10 text-chart-3">
						<ShieldCheck className="size-6" aria-hidden="true" />
					</span>
					<div>
						<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
							User Access
						</h1>
						<p className="mt-1 text-sm text-muted-foreground sm:text-base">
							Control which accounts and locations each user can access.
						</p>
					</div>
				</header>

				<UserControls
					showActiveOnly={showActiveOnly}
					setShowActiveOnly={setShowActiveOnly}
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					searchPlaceholder="Search users"
				/>

				<div className="mt-4 flex flex-wrap items-center gap-2 px-1 text-sm text-muted-foreground">
					<span>
						{filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'}
					</span>
					<span aria-hidden="true">·</span>
					<span>{accounts.length} accounts</span>
					<span aria-hidden="true">·</span>
					<span>{locations.length} locations</span>
				</div>

				<Card className="mt-6 hidden gap-0 overflow-hidden py-0 shadow-sm md:block">
					<div className="grid grid-cols-[minmax(260px,2fr)_minmax(120px,0.8fr)_minmax(120px,0.7fr)_minmax(120px,0.7fr)_minmax(240px,1fr)] items-center bg-muted/60 px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
						<span>User</span>
						<span>Role</span>
						<span className="text-center">Accounts</span>
						<span className="text-center">Locations</span>
						<span className="text-center">Manage access</span>
					</div>

					{paginatedUsers.map((user) => (
						<div
							key={user.id ?? user.userEmail}
							className="grid min-h-24 grid-cols-[minmax(260px,2fr)_minmax(120px,0.8fr)_minmax(120px,0.7fr)_minmax(120px,0.7fr)_minmax(240px,1fr)] items-center border-t px-6 transition-colors hover:bg-muted/30"
						>
							<UserIdentity user={user} />
							<Badge variant="outline" className="w-fit">
								{formatRole(user.appRole)}
							</Badge>
							<AccessCount
								count={user.id ? userAccess[user.id]?.length ?? 0 : 0}
								label="accounts"
							/>
							<AccessCount
								count={user.id ? userLocationAccess[user.id]?.length ?? 0 : 0}
								label="locations"
							/>
							<AccessActions user={user} onOpen={openAccessDialog} />
						</div>
					))}
					{paginatedUsers.length === 0 && <EmptyUsers searchTerm={searchTerm} />}
				</Card>

				<div className="mt-6 space-y-4 md:hidden">
					{paginatedUsers.map((user) => (
						<Card
							key={user.id ?? user.userEmail}
							className="gap-0 overflow-hidden py-0 shadow-sm"
						>
							<div className="p-5">
								<UserIdentity user={user} />
								<div className="mt-4 flex flex-wrap items-center gap-2">
									<Badge variant="outline">{formatRole(user.appRole)}</Badge>
									<Badge variant={user.userActive === false ? 'secondary' : 'default'}>
										{user.userActive === false ? 'Inactive' : 'Active'}
									</Badge>
								</div>
							</div>
							<div className="grid grid-cols-2 border-t bg-muted/20">
								<MobileCount
									label="Accounts"
									count={user.id ? userAccess[user.id]?.length ?? 0 : 0}
								/>
								<MobileCount
									label="Locations"
									count={user.id ? userLocationAccess[user.id]?.length ?? 0 : 0}
									bordered
								/>
							</div>
							<div className="border-t px-4 py-3">
								<AccessActions user={user} onOpen={openAccessDialog} />
							</div>
						</Card>
					))}
					{paginatedUsers.length === 0 && <EmptyUsers searchTerm={searchTerm} mobile />}
				</div>

				<Pagination
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
					pageSize={pageSize}
					setPageSize={setPageSize}
					totalItems={filteredUsers.length}
				/>
			</div>

			<Dialog
				open={dialogMode !== null}
				onOpenChange={(isOpen) => {
					if (!isOpen) closeAccessDialog();
				}}
			>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							{dialogMode === 'accounts' ? (
								<Building2 className="size-5 text-chart-3" aria-hidden="true" />
							) : (
								<MapPin className="size-5 text-chart-3" aria-hidden="true" />
							)}
							Edit {dialogMode === 'accounts' ? 'accounts' : 'locations'}
						</DialogTitle>
						<DialogDescription>
							Choose the {dialogMode} available to {displayName(selectedUser)}.
						</DialogDescription>
					</DialogHeader>

					<div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm">
						<span className="font-medium">
							{selectedIds.length} of {resources.length} selected
						</span>
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSelectedIds(resources.map((resource) => resource.id))}
								disabled={saving || resources.length === 0}
							>
								Select all
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSelectedIds([])}
								disabled={saving || selectedIds.length === 0}
							>
								Clear
							</Button>
						</div>
					</div>

					<ScrollArea className="h-80 rounded-xl border">
						<div className="space-y-2 p-3">
							{resources.map((resource) => {
								const checkboxId = `${dialogMode}-${resource.id}`;
								return (
									<label
										key={resource.id}
										htmlFor={checkboxId}
										className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
									>
										<Checkbox
											id={checkboxId}
											checked={selectedIds.includes(resource.id)}
											onCheckedChange={() => toggleResource(resource.id)}
											disabled={saving}
											className="mt-0.5"
										/>
										<span className="min-w-0">
											<span className="block font-medium">{resource.name}</span>
											<span className="mt-0.5 block text-xs text-muted-foreground">
												{resource.description}
											</span>
										</span>
									</label>
								);
							})}
							{resources.length === 0 && (
								<p className="px-4 py-16 text-center text-sm text-muted-foreground">
									No {dialogMode} are available.
								</p>
							)}
						</div>
					</ScrollArea>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => closeAccessDialog()}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button onClick={saveAccess} disabled={saving || !hasChanges}>
							{saving ? 'Saving…' : 'Save access'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	);
}

function UserIdentity({ user }: { user: User }) {
	return (
		<div className="flex min-w-0 items-center gap-3">
			<Avatar className="size-11 border">
				<AvatarImage src={user.userImage ?? undefined} alt="" />
				<AvatarFallback className="font-semibold text-chart-3">
					{initials(user.userName)}
				</AvatarFallback>
			</Avatar>
			<div className="min-w-0">
				<div className="flex flex-wrap items-center gap-2">
					<p className="truncate font-semibold">{displayName(user)}</p>
					<UserInvitationStatus user={user} />
				</div>
				<p className="mt-1 truncate text-xs text-muted-foreground">
					{user.userEmail || 'No email address'}
				</p>
			</div>
		</div>
	);
}

function AccessActions({
	user,
	onOpen,
}: {
	user: User;
	onOpen: (user: User, mode: DialogMode) => void;
}) {
	return (
		<div className="flex flex-wrap items-center justify-center gap-2">
			<Button
				variant="outline"
				size="sm"
				className="gap-2"
				onClick={() => onOpen(user, 'accounts')}
				disabled={!user.id}
			>
				<Building2 className="size-4" aria-hidden="true" />
				Accounts
			</Button>
			<Button
				variant="outline"
				size="sm"
				className="gap-2"
				onClick={() => onOpen(user, 'locations')}
				disabled={!user.id}
			>
				<MapPin className="size-4" aria-hidden="true" />
				Locations
			</Button>
		</div>
	);
}

function AccessCount({ count, label }: { count: number; label: string }) {
	return (
		<div className="text-center">
			<span className="text-lg font-semibold">{count}</span>
			<span className="sr-only"> {label}</span>
		</div>
	);
}

function MobileCount({
	label,
	count,
	bordered = false,
}: {
	label: string;
	count: number;
	bordered?: boolean;
}) {
	return (
		<div className={`px-5 py-4 text-center ${bordered ? 'border-l' : ''}`}>
			<p className="text-xl font-semibold">{count}</p>
			<p className="text-xs text-muted-foreground">{label}</p>
		</div>
	);
}

function EmptyUsers({
	searchTerm,
	mobile = false,
}: {
	searchTerm: string;
	mobile?: boolean;
}) {
	return (
		<div
			className={`${mobile ? 'rounded-2xl border border-dashed' : 'border-t'} px-6 py-14 text-center text-sm text-muted-foreground`}
		>
			{searchTerm ? `No users match “${searchTerm}”.` : 'No users are available.'}
		</div>
	);
}

function compactIds(records: Array<{ id?: string }>) {
	return records.flatMap((record) => (record.id ? [record.id] : []));
}

function assertSuccessful(results: RequestResult[]) {
	const failed = results.find((result) => result.error);
	if (failed?.error) throw new Error(failed.error);
}

function sameIds(first: string[], second: string[]) {
	return (
		first.length === second.length &&
		first.every((id) => second.includes(id))
	);
}

function displayName(user?: User | null) {
	return user?.userName || user?.userEmail || 'this user';
}

function initials(name?: string | null) {
	if (!name) return 'U';
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');
}

function formatRole(role?: string | null) {
	if (!role) return 'No role';
	return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatLocation(location: Locations) {
	const cityState = [location.locationTown, location.locationState]
		.filter(Boolean)
		.join(', ');
	return cityState || (location.locationActive ? 'Active location' : 'Inactive location');
}
