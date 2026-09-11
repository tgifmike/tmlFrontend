'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import { deleteUser, getUsersForAccount, toggleUserActive, updateUser, updateUserAccessRole, updateUserAppRole } from '@/app/api/userApI';
import { AccessRole, AppRole, User } from '@/app/types';
import { DataCard } from '@/components/cards/DataCard';
import { InviteUserDialog } from '@/components/invite/InviteUserDialog';
import { CreatePinEmployeeDialog } from '@/components/invite/CreatePinEmployeeDialog';
import LeftNav from '@/components/navBar/LeftNav';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';
import Spinner from '@/components/spinner/Spinner';
import { AccessRoleSelectOrBadge } from '@/components/tableComponents/AccessRoleSelect';
import { AppRoleSelect } from '@/components/tableComponents/AppRoleSelect';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { EditUserDialog } from '@/components/tableComponents/EditUserDialog';
import { Pagination } from '@/components/tableComponents/Pagination';
import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { UserControls } from '@/components/tableComponents/UserControls';
import { UserInvitationStatus } from '@/components/tableComponents/UserInvitationStatus';
import { UserPinDialog } from '@/components/tableComponents/UserPinDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useSession } from '@/lib/auth/session-context';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const isPinOnlyUser = (user: User) => {
	const mode = String(user.authenticationMode ?? '').toUpperCase();
	return mode === 'PIN_ONLY' || (!user.userEmail && user.invited === false);
};

const AccountUsersPage = () => {
	const { user: sessionUser, loading: sessionLoading } = useSession();
	const currentUser = sessionUser as User | undefined;
	const currentUserId = currentUser?.id;
	const sessionUserRole = currentUser?.appRole;
	const canManage = currentUser?.appRole === AppRole.MANAGER;
	const router = useRouter();
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountIdParam = params.accountId;
	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [showActiveOnly, setShowActiveOnly] = useState(true);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [users, setUsers] = useState<User[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [drawerOpen, setDrawerOpen] = useState(false);

	useEffect(() => {
		if (sessionLoading) return;
		setHasAccess(false);
		if (!currentUserId || !accountIdParam) {
			setLoadingAccess(false);
			return;
		}

		let cancelled = false;
		const verifyAccess = async () => {
			setLoadingAccess(true);
			try {
				const accountsRes = await getAccountsForUser(currentUserId);
				if (cancelled) return;
				if (accountsRes.error) throw new Error(accountsRes.error);
				const account = accountsRes.data?.find((item) => item.id?.toString() === accountIdParam);
				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}
				const userRes = await getUsersForAccount(accountIdParam);
				if (cancelled) return;
				if (userRes.error) throw new Error(userRes.error);
				setHasAccess(true);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || account.accountImage || null);
				setUsers(userRes.data ?? []);
			} catch (error) {
				if (cancelled) return;
				toast.error(error instanceof Error ? error.message : 'Failed to load account users.');
				router.push('/accounts');
			} finally {
				if (!cancelled) setLoadingAccess(false);
			}
		};
		verifyAccess();
		return () => {
			cancelled = true;
		};
	}, [sessionLoading, currentUserId, accountIdParam, router]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setCurrentPage(Number(localStorage.getItem('accountUsersCurrentPage')) || 1);
			setPageSize(Number(localStorage.getItem('accountUsersPageSize')) || 10);
		}
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('accountUsersCurrentPage', String(currentPage));
			localStorage.setItem('accountUsersPageSize', String(pageSize));
		}
	}, [currentPage, pageSize]);

	const filteredUsers = users.filter((item) => {
		const query = searchTerm.toLowerCase();
		return (item.userName ?? '').toLowerCase().includes(query) || (item.userEmail ?? '').toLowerCase().includes(query);
	}).filter((item) => !showActiveOnly || item.userActive);

	const handleToggleActive = async (userId: string, checked: boolean) => {
		if (!canManage || userId === currentUserId) return;
		const response = await toggleUserActive(userId, checked);
		if (response.error) throw new Error(response.error);
		setUsers((prev) => prev.map((item) => item.id === userId ? { ...item, userActive: checked } : item));
	};

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, showActiveOnly, pageSize]);

	const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	const handleAccessRoleChange = async (
		userId: string,
			newRole: AccessRole
		) => {
			try {
				await updateUserAccessRole(userId, newRole);
	
				setUsers((prev) =>
					prev.map((u) => (u.id === userId ? { ...u, accessRole: newRole } : u))
				);
				const updatedUser = users.find((u) => u.id === userId);
				toast.success(
					`User:  ${
						updatedUser?.userName ?? 'unknown'
					} access role updated to ${newRole}`
				);
			} catch (error: any) {
				toast.error('Failed to update user access role: ' + error.message);
			}
		};
	
		// edit app role
		const handleAppRoleChange = async (userId: string, newRole: AppRole) => {
			try {
				await updateUserAppRole(userId, newRole);
	
				setUsers((prev) =>
					prev.map((u) => (u.id === userId ? { ...u, appRole: newRole } : u))
				);
				const updatedUser = users.find((u) => u.id === userId);
				toast.success(
					`User:  ${
						updatedUser?.userName ?? 'unknown'
					} app role updated to ${newRole}`
				);
			} catch (error: any) {
				toast.error('Failed to update user app role: ' + error.message);
			}
		};
	
		//updating user name and email
		const handleUpdateUser = async (id: string, name: string, email: string) => {
			try {
				const result = await updateUser(id, { name, email });
	
				// Update frontend state
				setUsers((prev) =>
					prev.map((u) =>
						u.id === id ? { ...u, userName: name, userEmail: email } : u
					)
				);
	
				toast.success(result); // show "User updated successfully"
			} catch (error: any) {
				const message =
					error.response?.data || error.message || 'Failed to update user';
				toast.error(message);
			}
		};
	
		//pagination
		useEffect(() => {
			localStorage.setItem('usersCurrentPage', String(currentPage));
		}, [currentPage]);
	
		useEffect(() => {
			localStorage.setItem('usersPageSize', String(pageSize));
			setCurrentPage(1); // reset to first page when pageSize changes
		}, [pageSize]);
	
		// slice for current page
		const renderedUsers = filteredUsers.slice(
			(currentPage - 1) * pageSize,
			currentPage * pageSize
		);
	
		
	
		
	

	if (sessionLoading || loadingAccess) {
		return (
			<div className="flex items-center justify-center py-40 text-xl text-chart-3">
				<Spinner />
				<span className="ml-4">Loading users…</span>
			</div>
		);
	}

	if (!currentUserId || !hasAccess) return null;

	return (
		<div className="flex">
			{/* Desktop Sidebar */}
			<aside className="hidden md:block md:w-10 lg:w-72 border-r h-screen bg-ring shrink-0">
				<LeftNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountIdParam}
					sessionUserRole={sessionUserRole ?? undefined}
				/>
			</aside>

			{/* Main Content */}
			<section className="flex-1 min-w-0 flex flex-col">
				{/* Header */}
				<header className="flex flex-wrap gap-3 justify-between items-center px-4 py-3 border-b">
					{/* Left */}
					<div className="flex">
						{/* Mobile Drawer */}
						<MobileDrawerNav
							open={drawerOpen}
							setOpen={setDrawerOpen}
							title="Menu"
						>
							<LeftNav
								accountName={accountName}
								accountImage={accountImage}
								accountId={accountIdParam}
								sessionUserRole={sessionUserRole ?? undefined}
							/>
						</MobileDrawerNav>

						<h1 className="text-2xl font-semibold">Account Users Page</h1>
					</div>
					<div className="flex flex-wrap justify-end gap-2"><InviteUserDialog accountId={accountIdParam} onUserCreated={(user: User) => setUsers((prev) => [...prev, user])} />{canManage && <CreatePinEmployeeDialog accountId={accountIdParam} onUserCreated={(user) => setUsers((prev) => [...prev, user])} />}</div>
				</header>

				{/* Controls */}
				<div className="w-full mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2 mt-4">
					<UserControls
						showActiveOnly={showActiveOnly}
						setShowActiveOnly={setShowActiveOnly}
						searchTerm={searchTerm}
						setSearchTerm={setSearchTerm}
					/>
				</div>
				{/* Desktop Table */}
				<Card className="mx-2 mt-6 hidden gap-0 overflow-hidden py-0 shadow-sm md:block">
						<ReusableTable
							data={paginatedUsers}
							rowKey={(u) => u.id!}
							headerRowClassName="bg-muted/60 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:bg-muted/60"
							rowClassName="border-t text-sm transition-colors hover:bg-muted/30"
							columns={[
								{
								header: 'User',
								render: (u) => <UserIdentity user={u} />,
							},
				{
					header: 'Sign-in',
					className: 'text-center',
					render: (u) => <SignInBadge user={u} />,
				},
								{
									header: 'Invitation',
									className: 'text-center',
									render: (u) => <UserInvitationStatus user={u} />,
								},
								{
									header: 'Status',
									className: 'text-center ',
									render: (u) => (
										<StatusSwitchOrBadge
											entity={{
												id: u.id!,
												active: u.userActive!,
											}}
											getLabel={() => `User: ${u.userName}`}
											onToggle={handleToggleActive}
											canToggle={canManage && u.id !== currentUserId}
										/>
									),
								},
								{
									header: 'Access Role',
									className: 'text-center',
									render: (u) => (
										<AccessRoleSelectOrBadge
											user={u}
											onRoleChange={(id, role) =>
												setUsers((prev) =>
													prev.map((user) =>
														user.id === id
															? { ...user, accessRole: role }
															: user,
													),
												)
											}
										/>
									),
								},
								{
									header: 'App Role',
									render: (u) => (
										<AppRoleSelect
											user={u}
											onRoleChange={(id, role) =>
												setUsers((prev) =>
													prev.map((user) =>
														user.id === id ? { ...user, appRole: role } : user,
													),
												)
											}
										/>
									),
								},
								{
									header: 'Actions',
									className: 'text-center',
									render: (u) =>
										canManage ? (
											<div className="flex justify-center gap-4 items-center">
														<UserPinDialog
															accountId={accountIdParam}
															user={u}
															onPinRevoked={(id) => setUsers((previous) => previous.map((item) => item.id === id ? { ...item, pinConfigured: false } : item))}
													onPinConfigured={(id) =>
														setUsers((previous) =>
															previous.map((existingUser) =>
																existingUser.id === id
																	? { ...existingUser, pinConfigured: true }
																	: existingUser,
															),
														)
													}
												/>
												<EditUserDialog
													users={users}
													user={u}
													onUpdate={(id, name, email) =>
														setUsers((prev) =>
															prev.map((user) =>
																user.id === id
																	? {
																			...user,
																			userName: name,
																			userEmail: email,
																		}
																	: user,
															),
														)
													}
												/>
												{u.id && u.id !== currentUserId ? (
													<DeleteConfirmButton
														item={{ id: u.id }}
														entityLabel="user"
														onDelete={async (id) => {
															await deleteUser(id);
															setUsers((prev) =>
																prev.filter((user) => user.id !== id),
															);
														}}
														getItemName={() => u.userName ?? 'Unknown'} // guarantee a string
													/>
												) : (
													<Badge variant="outline">You</Badge>
												)}
											</div>
										) : (
											<span className="text-ring">No Actions</span>
										),
								},
							]}
						/>
				</Card>

				{/* Mobile Cards */}
				<div className="block md:hidden mt-6 space-y-4 p-2">
					{paginatedUsers.map((user) => (
						<DataCard
							key={user.id}
							title={user.userName ?? 'No Name'}
							description={user.userEmail ?? undefined}
							avatar={
								<Avatar>
									<AvatarImage src={user.userImage ?? undefined} />
									<AvatarFallback className="font-semibold text-chart-3">
										{initials(user.userName || user.userEmail)}
									</AvatarFallback>
								</Avatar>
							}
							fields={[
								{
									label: 'Invitation',
									value: <UserInvitationStatus user={user} />,
								},
								{
									label: 'Sign-in',
									value: <SignInBadge user={user} />,
								},
								{
									label: 'Status',
									value: (
										<StatusSwitchOrBadge
											entity={{ id: user.id!, active: user.userActive ?? false }}
											getLabel={() => `User: ${user.userName}`}
											onToggle={handleToggleActive}
											canToggle={canManage && user.id !== currentUserId}
										/>
									),
								},
								{
									label: 'Access Role',
									value: (
										<AccessRoleSelectOrBadge
											user={user}
											onRoleChange={(id, role) =>
												setUsers((prev) =>
													prev.map((u) =>
														u.id === id ? { ...u, accessRole: role } : u,
													),
												)
											}
										/>
									),
								},
								{
									label: 'App Role',
									value: (
										<AppRoleSelect
											user={user}
											onRoleChange={(id, role) =>
												setUsers((prev) =>
													prev.map((u) =>
														u.id === id ? { ...u, appRole: role } : u,
													),
												)
											}
										/>
									),
								},
							]}
							actions={[
								{
									element: canManage ? (
										<UserPinDialog
															accountId={accountIdParam}
															user={user}
															onPinRevoked={(id) => setUsers((previous) => previous.map((item) => item.id === id ? { ...item, pinConfigured: false } : item))}
											onPinConfigured={(id) =>
												setUsers((previous) =>
													previous.map((existingUser) =>
														existingUser.id === id
															? { ...existingUser, pinConfigured: true }
															: existingUser,
													),
												)
											}
										/>
									) : null,
								},
								{
									element: canManage ? (
										<EditUserDialog
											users={users}
											user={user}
											onUpdate={(id, name, email) =>
												setUsers((prev) =>
													prev.map((user) =>
														user.id === id
															? { ...user, userName: name, userEmail: email }
															: user,
													),
												)
											}
										/>
									) : null,
								},
								{
									element: canManage ? (user.id && user.id !== currentUserId ? (
										<DeleteConfirmButton
											item={{ id: user.id }}
											entityLabel="user"
											onDelete={async (id) => {
												await deleteUser(id);
												setUsers((prev) => prev.filter((u) => u.id !== id));
											}}
											getItemName={() => user.userName ?? 'Unknown'} // always returns string
										/>
									) : <Badge variant="outline">You</Badge>) : null,
								},
							]}
						/>
					))}
				</div>

				{/* pagination page size selector */}
				<div className="w-full mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2 mt-4">
					<Pagination
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
						pageSize={pageSize}
						setPageSize={setPageSize}
						totalItems={filteredUsers.length}
					/>
				</div>
			</section>

			{/* {users.map((user) => (
				<div>{user.userName}</div>
			))} */}
		</div>
	);
};

function UserIdentity({ user }: { user: User }) {
	return (
		<div className="flex min-w-0 items-center gap-3">
			<Avatar className="size-11 border">
				<AvatarImage src={user.userImage ?? undefined} alt="" />
				<AvatarFallback className="font-semibold text-chart-3">
					{initials(user.userName || user.userEmail)}
				</AvatarFallback>
			</Avatar>
			<div className="min-w-0">
				<p className="truncate font-semibold">
					{user.userName || user.userEmail || 'Unknown user'}
				</p>
				<p className="mt-1 truncate text-xs text-muted-foreground">
					{user.userEmail || 'No email address'}
				</p>
			</div>
		</div>
	);
}

function SignInBadge({ user }: { user: User }) {
	return isPinOnlyUser(user) ? (
		<Badge variant="secondary" className="border-amber-200 bg-amber-50 text-amber-800">
			PIN user
		</Badge>
	) : (
		<Badge
			variant="outline"
			className="border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300"
		>
			Auth user
		</Badge>
	);
}

function initials(name?: string | null) {
	if (!name) return 'U';
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default AccountUsersPage;
