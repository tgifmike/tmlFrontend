'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	deleteUser,
	getAllUsers,
	toggleUserActive,
	updateUser,
	updateUserAccessRole,
	updateUserAppRole,
} from '@/app/api/userApI';
import { toast } from 'sonner';
import { AccessRole, AppRole, User } from '@/app/types';
import { UserStatusSwitchOrBadge } from '@/components/tableComponents/UserStatusSwitch';
import { AccessRoleSelectOrBadge } from '@/components/tableComponents/AccessRoleSelect';
import { AppRoleSelect } from '@/components/tableComponents/AppRoleSelect';
import { DeleteUserButton } from '@/components/tableComponents/DeleteUserButton';
import Spinner from '@/components/spinner/Spinner';
import { EditUserDialog } from '@/components/tableComponents/EditUserDialog';
import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
import { DataCard } from '@/components/cards/DataCard';
import { Pagination } from '@/components/tableComponents/Pagination';
import { UserControls } from '@/components/tableComponents/UserControls';
import { Icons } from '@/components/icon';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { useSession } from 'next-auth/react';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';

const Page = () => {
	//icons
	const UserIcon = Icons.user;

	//session
	const { data: session } = useSession();
	const currentUser = session?.user as User | undefined;
	const sessionUserRole = session?.user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;

	//set state
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Load pagination settings from localStorage safely
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedPage = Number(localStorage.getItem('usersCurrentPage')) || 1;
			const storedPageSize =
				Number(localStorage.getItem('usersPageSize')) || 10;
			setCurrentPage(storedPage);
			setPageSize(storedPageSize);
		}
	}, []);

	// Persist pagination to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('usersCurrentPage', String(currentPage));
		}
	}, [currentPage]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('usersPageSize', String(pageSize));
		}
	}, [pageSize]);


	//fetch users on component mount
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await getAllUsers();
				setUsers(response.data || []);
			} catch (error: any) {
				toast.error('Failed to fetch users: ' + (error.message || error));
			} finally {
				setLoading(false);
			}
		};
		fetchUsers();
	}, []);

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
	if (loading || users == null)
		return (
			<div className="flex justify-center items-center py-40  text-chart-3 text-xl">
				<Spinner />
				<span className="ml-4">Loading Users…</span>
			</div>
		);

	return (
		<main className="pt-4">
			<div className="w-3/4 flex mx-auto">
				<h1 className="text-3xl font-bold text-center mb-4">
					Admin Users Page
				</h1>
			</div>

			{/* table header */}
			<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
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
							className: 'text-center',
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
												user.id === id ? { ...user, accessRole: role } : user
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
															? { ...user, userName: name, userEmail: email }
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
		</main>
	);
};

export default Page;
