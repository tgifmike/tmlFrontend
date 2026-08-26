'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { deleteUser, getAllUsers, toggleUserActive } from '@/app/api/userApI';
import { AccessRole, AppRole, User } from '@/app/types';
import { AccessRoleSelectOrBadge } from '@/components/tableComponents/AccessRoleSelect';
import { AppRoleSelect } from '@/components/tableComponents/AppRoleSelect';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { EditUserDialog } from '@/components/tableComponents/EditUserDialog';
import { Pagination } from '@/components/tableComponents/Pagination';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import UserHistoryFeed from '@/components/tableComponents/UserHistoryFeed';
import { UserControls } from '@/components/tableComponents/UserControls';
import { UserInvitationStatus } from '@/components/tableComponents/UserInvitationStatus';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useSession } from '@/lib/auth/session-context';

const AdminUsersPage = () => {
	const { user: sessionUser, loading: sessionLoading } = useSession();
	const currentUser = sessionUser as User | undefined;
	const currentUserId = currentUser?.id;
	const canManage = currentUser?.appRole === AppRole.MANAGER;
	const canViewHistory = currentUser?.accessRole === AccessRole.SRADMIN;

	const [users, setUsers] = useState<User[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(true);
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

	useEffect(() => {
		if (sessionLoading) return;

		let cancelled = false;
		const loadUsers = async () => {
			setLoadingUsers(true);
			try {
				const response = await getAllUsers();
				if (response.error) throw new Error(response.error);
				if (!cancelled) setUsers(response.data ?? []);
			} catch (error) {
				if (!cancelled) {
					toast.error(
						error instanceof Error ? error.message : 'Failed to load users.',
					);
				}
			} finally {
				if (!cancelled) setLoadingUsers(false);
			}
		};

		loadUsers();
		return () => {
			cancelled = true;
		};
	}, [sessionLoading]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		setCurrentPage(Number(localStorage.getItem('usersCurrentPage')) || 1);
		setPageSize(Number(localStorage.getItem('usersPageSize')) || 10);
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('usersCurrentPage', String(currentPage));
		}
	}, [currentPage]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('usersPageSize', String(pageSize));
		}
		setCurrentPage(1);
	}, [pageSize]);

	const filteredUsers = users.filter((user) => {
		const normalizedSearch = searchTerm.trim().toLowerCase();
		const matchesSearch =
			!normalizedSearch ||
			(user.userName ?? '').toLowerCase().includes(normalizedSearch) ||
			(user.userEmail ?? '').toLowerCase().includes(normalizedSearch);
		return matchesSearch && (!showActiveOnly || user.userActive === true);
	});

	const paginatedUsers = filteredUsers.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, showActiveOnly]);

	useEffect(() => {
		const lastPage = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
		if (currentPage > lastPage) setCurrentPage(lastPage);
	}, [currentPage, filteredUsers.length, pageSize]);

	const handleToggleActive = async (userId: string, checked: boolean) => {
		setUsers((previous) =>
			previous.map((user) =>
				user.id === userId ? { ...user, userActive: checked } : user,
			),
		);

		try {
			const response = await toggleUserActive(userId, checked);
			if (response.error) throw new Error(response.error);
			setHistoryRefreshKey((key) => key + 1);
			toast.success(`User is now ${checked ? 'active' : 'inactive'}.`);
		} catch (error) {
			setUsers((previous) =>
				previous.map((user) =>
					user.id === userId ? { ...user, userActive: !checked } : user,
				),
			);
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to update user status.',
			);
		}
	};

	const updateUserInState = (userId: string, changes: Partial<User>) => {
		setUsers((previous) =>
			previous.map((user) =>
				user.id === userId ? { ...user, ...changes } : user,
			),
		);
		setHistoryRefreshKey((key) => key + 1);
	};

	const handleDelete = async (userId: string) => {
		await deleteUser(userId);
		setUsers((previous) => previous.filter((user) => user.id !== userId));
		setHistoryRefreshKey((key) => key + 1);
	};

	if (sessionLoading || loadingUsers) {
		return (
			<div className="flex items-center justify-center py-40 text-xl text-chart-3">
				<div className="size-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
				<span className="ml-4">Loading users…</span>
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
							Manage Users
						</h1>
						<p className="mt-1 text-sm text-muted-foreground sm:text-base">
							Review invitations, user status, roles, and account-wide permissions.
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
					<span>{users.filter((user) => user.userActive).length} active</span>
					<span aria-hidden="true">·</span>
					<span>{users.filter(isPendingInvite).length} pending</span>
				</div>

				<Card className="mt-6 hidden gap-0 overflow-hidden py-0 shadow-sm md:block">
					<div className="grid grid-cols-[minmax(260px,2fr)_minmax(130px,1fr)_minmax(110px,0.8fr)_minmax(155px,1fr)_minmax(155px,1fr)_minmax(130px,0.8fr)] items-center bg-muted/60 px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
						<span>User</span>
						<span>Invitation</span>
						<span className="text-center">Status</span>
						<span className="text-center">Access role</span>
						<span className="text-center">App role</span>
						<span className="text-center">Actions</span>
					</div>

					{paginatedUsers.map((user) => (
						<div
							key={user.id ?? user.userEmail}
							className="grid min-h-24 grid-cols-[minmax(260px,2fr)_minmax(130px,1fr)_minmax(110px,0.8fr)_minmax(155px,1fr)_minmax(155px,1fr)_minmax(130px,0.8fr)] items-center border-t px-6 transition-colors hover:bg-muted/30"
						>
							<UserIdentity user={user} />
							<div><UserInvitationStatus user={user} /></div>
							<div className="flex flex-col items-center gap-1.5">
								<StatusSwitchOrBadge
									entity={{ id: user.id!, active: user.userActive ?? false }}
									getLabel={() => `User: ${displayName(user)}`}
									onToggle={handleToggleActive}
									canToggle={canManage && user.id !== currentUserId}
								/>
								<span className="text-xs text-muted-foreground">
									{user.userActive ? 'Active' : 'Inactive'}
								</span>
							</div>
							<div className="flex justify-center">
								<AccessRoleSelectOrBadge
									user={user}
									onRoleChange={(id, role) =>
										updateUserInState(id, { accessRole: role })
									}
								/>
							</div>
							<div className="flex justify-center">
								<AppRoleSelect
									user={user}
									onRoleChange={(id, role) =>
										updateUserInState(id, { appRole: role })
									}
								/>
							</div>
							<UserActions
								user={user}
								users={users}
								canManage={canManage}
								isCurrentUser={user.id === currentUserId}
								onUpdate={(id, name, email) =>
									updateUserInState(id, { userName: name, userEmail: email })
								}
								onDelete={handleDelete}
							/>
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
								<div className="mt-4">
									<UserInvitationStatus user={user} />
								</div>
							</div>

							<MobileField label="Status">
								<div className="flex items-center gap-3">
									<StatusSwitchOrBadge
										entity={{ id: user.id!, active: user.userActive ?? false }}
										getLabel={() => `User: ${displayName(user)}`}
										onToggle={handleToggleActive}
										canToggle={canManage && user.id !== currentUserId}
									/>
									<span className="text-sm font-medium">
										{user.userActive ? 'Active' : 'Inactive'}
									</span>
								</div>
							</MobileField>
							<MobileField label="Access role">
								<AccessRoleSelectOrBadge
									user={user}
									onRoleChange={(id, role) =>
										updateUserInState(id, { accessRole: role })
									}
								/>
							</MobileField>
							<MobileField label="App role">
								<AppRoleSelect
									user={user}
									onRoleChange={(id, role) =>
										updateUserInState(id, { appRole: role })
									}
								/>
							</MobileField>

							{canManage && (
								<div className="flex items-center justify-between border-t px-5 py-2">
									<span className="text-sm font-medium text-muted-foreground">
										Manage user
									</span>
									<UserActions
										user={user}
										users={users}
										canManage={canManage}
										isCurrentUser={user.id === currentUserId}
										onUpdate={(id, name, email) =>
											updateUserInState(id, {
												userName: name,
												userEmail: email,
											})
										}
										onDelete={handleDelete}
									/>
								</div>
							)}
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

				{canViewHistory && (
					<div className="mt-8">
						<UserHistoryFeed refreshKey={historyRefreshKey} />
					</div>
				)}
			</div>
		</main>
	);
};

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
				<div className="flex items-center gap-2">
					<p className="truncate font-semibold">{displayName(user)}</p>
					{user.userActive === false && (
						<Badge variant="secondary" className="shrink-0">Inactive</Badge>
					)}
				</div>
				<p className="mt-1 truncate text-xs text-muted-foreground">
					{user.userEmail || 'No email address'}
				</p>
			</div>
		</div>
	);
}

function UserActions({
	user,
	users,
	canManage,
	isCurrentUser,
	onUpdate,
	onDelete,
}: {
	user: User;
	users: User[];
	canManage: boolean;
	isCurrentUser: boolean;
	onUpdate: (id: string, name: string, email: string) => void;
	onDelete: (id: string) => Promise<void>;
}) {
	if (!canManage) {
		return <div className="text-center text-sm text-muted-foreground">View only</div>;
	}

	return (
		<div className="flex items-center justify-center gap-1">
			<EditUserDialog users={users} user={user} onUpdate={onUpdate} />
			{user.id && !isCurrentUser ? (
				<DeleteConfirmButton
					item={{ id: user.id }}
					entityLabel="User"
					onDelete={onDelete}
					getItemName={() => displayName(user)}
				/>
			) : (
				<Badge variant="outline">You</Badge>
			)}
		</div>
	);
}

function MobileField({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-14 items-center justify-between gap-4 border-t px-5 py-3">
			<span className="text-sm font-medium text-muted-foreground">{label}</span>
			<div className="flex justify-end">{children}</div>
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

const isPendingInvite = (user: User) =>
	user.invited === true && user.firstLogin === true;

function displayName(user: User) {
	return user.userName || user.userEmail || 'Unknown user';
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

export default AdminUsersPage;
