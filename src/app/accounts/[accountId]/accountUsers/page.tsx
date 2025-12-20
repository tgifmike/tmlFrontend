'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import { deleteUser, getUsersForAccount, toggleUserActive, updateUser, updateUserAccessRole, updateUserAppRole } from '@/app/api/userApI';
import { AccessRole, AppRole, User } from '@/app/types';
import { DataCard } from '@/components/cards/DataCard';
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
import { UserStatusSwitchOrBadge } from '@/components/tableComponents/UserStatusSwitch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/lib/icon';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import router from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const AccountUsersPage = () => {
	//icons
		const UserIcon = Icons.user;

	//session
	const { data: session, status } = useSession();
	const currentUser = session?.user as User | undefined;
	const sessionUserRole = session?.user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountIdParam = params.accountId;

	//set state
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
		if (status !== 'authenticated' || !session?.user?.id || !accountIdParam)
			return;
		if (hasAccess) return; // prevent rerun

		const verifyAccess = async () => {
			try {
				// Fetch accounts for user
				const accountsRes = await getAccountsForUser(session.user.id);
				const account = accountsRes.data?.find(
					(acc) => acc.id?.toString() === accountIdParam
				);

				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				// Fetch location access
				const userRes = await getUsersForAccount(accountIdParam);
				const fetchedUsers = userRes.data ?? [];
				


				setHasAccess(true);
				setAccountName(account.accountName);
                setAccountImage(account.imageBase64 || null);
                setUsers(fetchedUsers)
			} catch (err) {
				toast.error('You do not have access to this location.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session, accountIdParam, hasAccess, router]);

	// Load pagination settings from localStorage safely
		useEffect(() => {
			if (typeof window !== 'undefined') {
				const storedPage = Number(localStorage.getItem('accountUsersCurrentPage')) || 1;
				const storedPageSize =
					Number(localStorage.getItem('accountUsersPageSize')) || 10;
				setCurrentPage(storedPage);
				setPageSize(storedPageSize);
			}
		}, []);
	
		// Persist pagination to localStorage
		useEffect(() => {
			if (typeof window !== 'undefined') {
				localStorage.setItem('accountUsersCurrentPage', String(currentPage));
			}
		}, [currentPage]);
	
		useEffect(() => {
			if (typeof window !== 'undefined') {
				localStorage.setItem('accountUsersPageSize', String(pageSize));
			}
		}, [pageSize]);
	
	//toggle showing only active users and search
		const filteredUsers = users.filter((user) => {
			const name = user.userName ?? '';
			const email = user.userEmail ?? '';
	
			const matchesSearch =
				name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				email.toLowerCase().includes(searchTerm.toLowerCase());
	
			const matchesActive = showActiveOnly ? user.userActive : true;
	
			return matchesSearch && matchesActive;
		});
	
	//toggle user active status
		const handleToggleActive = async (userId: string, checked: boolean) => {
			try {
				await toggleUserActive(userId, checked);
	
				setUsers((prev) =>
					prev.map((u) => (u.id === userId ? { ...u, userActive: checked } : u))
				);
	
				const updatedUser = users.find((u) => u.id === userId);
				// toast.success(
				// 	`User:  ${updatedUser?.userName ?? 'unknown'} is now ${
				// 		checked ? 'active' : 'inactive'
				// 	}`
				// );
			} catch (error: any) {
				toast.error('Failed to update user status: ' + error.message);
			}
		};
	
		//update user access role
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
		const paginatedUsers = filteredUsers.slice(
			(currentPage - 1) * pageSize,
			currentPage * pageSize
		);
	
		//show loadding state
		if (loadingAccess || users == null)
			return (
				<div className="flex justify-center items-center py-40  text-chart-3 text-xl">
					<Spinner />
					<span className="ml-4">Loading Account Users…</span>
				</div>
			);
	
	
		
	

	return (
		<div className="flex flex-1 overflow-hidden">
			{/* Desktop Sidebar */}
			<aside className="hidden md:block w-1/6 border-r h-screen bg-ring">
				<LeftNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountIdParam}
					sessionUserRole={sessionUserRole ?? undefined}
				/>
			</aside>

			{/* Main Content */}
			<section className="flex-1 flex flex-col">
				{/* Header */}
				<header className="flex justify-between items-center px-4 py-3 border-b bg-background/70 backdrop-blur-md sticky top-0 z-20">
					{/* Left */}
					<div className="flex gap-8">
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
				</header>

				{/* Controls */}
				<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
					<UserControls
						showActiveOnly={showActiveOnly}
						setShowActiveOnly={setShowActiveOnly}
						searchTerm={searchTerm}
						setSearchTerm={setSearchTerm}
					/>
				</div>
					{/* Desktop Table */}
					<div className="hidden md:block mt-8 bg-accent p-4 rounded-2xl text-chart-3 w-3/4 mx-auto">
						<ReusableTable
							data={paginatedUsers}
							rowKey={(u) => u.id!}
							columns={[
								{
									header: '',
									render: (u) => (
										<Avatar>
											<AvatarImage src={u.userImage ?? undefined} />
											<AvatarFallback>
												<UserIcon className="h-6 w-6" />
											</AvatarFallback>
										</Avatar>
									),
								},
								{ header: 'User Name', render: (u) => u.userName },
								{ header: 'Email', render: (u) => u.userEmail },
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
											canToggle={canToggle}
											
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
															: user
													)
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
														user.id === id ? { ...user, appRole: role } : user
													)
												)
											}
										/>
									),
								},
								{
									header: 'Actions',
									className: 'text-center',
									render: (u) =>
										sessionUserRole === 'MANAGER' ? (
											<div className="flex justify-center gap-4 items-center">
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
																	: user
															)
														)
													}
												/>
												{u.id && (
													<DeleteConfirmButton
														item={{ id: u.id }}
														entityLabel="user"
														onDelete={async (id) => {
															await deleteUser(id);
															setUsers((prev) =>
																prev.filter((user) => user.id !== id)
															);
														}}
														getItemName={() => u.userName ?? 'Unknown'} // guarantee a string
													/>
												)}
											</div>
										) : (
											<span className="text-ring">No Actions</span>
										),
								},
							]}
						/>
					</div>

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
										<AvatarFallback>
											<UserIcon className="h-5 w-5 text-chart-3" />
										</AvatarFallback>
									</Avatar>
								}
								fields={[
									{
										label: 'Status',
										value: (
											<UserStatusSwitchOrBadge
												user={user}
												onStatusChange={(id, checked) =>
													setUsers((prev) =>
														prev.map((user) =>
															user.id === id
																? { ...user, userActive: checked }
																: user
														)
													)
												}
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
															u.id === id ? { ...u, accessRole: role } : u
														)
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
															u.id === id ? { ...u, appRole: role } : u
														)
													)
												}
											/>
										),
									},
								]}
								actions={[
									{
										element: (
											// <EditUserDialog user={user} onUpdate={handleUpdateUser} />
											<EditUserDialog
												users={users}
												user={user}
												onUpdate={(id, name, email) =>
													setUsers((prev) =>
														prev.map((user) =>
															user.id === id
																? { ...user, userName: name, userEmail: email }
																: user
														)
													)
												}
											/>
										),
									},
									{
										element: user.id ? (
											<DeleteConfirmButton
												item={{ id: user.id }}
												entityLabel="user"
												onDelete={async (id) => {
													await deleteUser(id);
													setUsers((prev) => prev.filter((u) => u.id !== id));
												}}
												getItemName={() => user.userName ?? 'Unknown'} // always returns string
											/>
										) : null,
									},
								]}
							/>
						))}
					</div>

					{/* pagination page size selector */}
					<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
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

export default AccountUsersPage;
