'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, UserRound } from 'lucide-react';
import {
	getAllUsers,
	toggleUserActive,
	updateUser,
	updateUserAccessRole,
	updateUserAppRole,
} from '@/app/api/userApI';
import { toast } from 'sonner';
import { AccessRole, AppRole, User } from '@/app/types';
import { UserStatusSwitch } from '@/components/tableComponents/UserStatusSwitch';
import { AccessRoleSelect } from '@/components/tableComponents/AccessRoleSelect';
import { AppRoleSelect } from '@/components/tableComponents/AppRoleSelect';
import { DeleteUserButton } from '@/components/tableComponents/DeleteUserButton';
import Spinner from '@/components/spinner/Spinner';
import { EditUserDialog } from '@/components/tableComponents/EditUserDialog';
import CreateUserDialog from '@/components/tableComponents/CreateUserForm';
import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { DataCard } from '@/components/cards/DataCard';

const Page = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);

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
			toast.success(
				`User:  ${updatedUser?.userName ?? 'unknown'} is now ${
					checked ? 'active' : 'inactive'
				}`
			);
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

	//show loadding state
	if (loading || users == null)
		return (
			<div className="flex justify-center items-center py-40  text-chart-3 text-xl">
				<Spinner />
				<span className="ml-4">Loading Users…</span>
			</div>
		);

	return (
		<main className="p-4">
			<h1 className="text-4xl font-bold mb-4">Users</h1>
			<Link href="/" className="text-blue-600 underline">
				Home
			</Link>

			<div>
				<CreateUserDialog
					onUserCreated={
						(newUser) => setUsers((prev) => [newUser, ...prev]) // prepend new user
					}
				/>
			</div>

			{/* Desktop Table */}
			<div className="hidden md:block mt-8 bg-accent p-4 rounded-2xl text-chart-3 w-3/4 mx-auto">
				<ReusableTable
					data={users}
					rowKey={(u) => u.id!}
					columns={[
						{
							header: '',
							render: (u) => (
								<Avatar>
									<AvatarImage src={u.userImage ?? undefined} />
									<AvatarFallback>
										<UserRound className="h-5 w-5 text-chart-3" />
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
								<UserStatusSwitch
									user={u}
									onStatusChange={(id, checked) =>
										setUsers((prev) =>
											prev.map((user) =>
												user.id === id ? { ...user, userActive: checked } : user
											)
										)
									}
								/>
							),
						},
						{
							header: 'Access Role',
							render: (u) => (
								<AccessRoleSelect
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
							render: (u) => (
								<div className="flex justify-center gap-4 items-center">
									<EditUserDialog
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
									<DeleteUserButton
										user={u}
										onDelete={(id) =>
											setUsers((prev) => prev.filter((user) => user.id !== id))
										}
									/>
								</div>
							),
						},
					]}
				/>
			</div>

		

			{/* Mobile Cards */}
			<div className="block md:hidden mt-6 space-y-4">
				{users.map((user) => (
					<DataCard
						key={user.id}
						title={user.userName ?? 'No Name'}
						description={user.userEmail ?? undefined}
						avatar={
							<Avatar>
								<AvatarImage src={user.userImage ?? undefined} />
								<AvatarFallback>
									<UserRound className="h-5 w-5 text-chart-3" />
								</AvatarFallback>
							</Avatar>
						}
						fields={[
							{
								label: 'Status',
								value: (
									<UserStatusSwitch
										user={user}
										onStatusChange={(id, checked) =>
											setUsers((prev) =>
												prev.map((u) =>
													u.id === id ? { ...u, userActive: checked } : u
												)
											)
										}
									/>
								),
							},
							{
								label: 'Access Role',
								value: (
									<AccessRoleSelect
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
									<EditUserDialog user={user} onUpdate={handleUpdateUser} />
								),
							},
							{
								element: (
									<DeleteUserButton
										user={user}
										onDelete={(id) =>
											setUsers((prev) => prev.filter((u) => u.id !== id))
										}
									/>
								),
							},
						]}
					/>
				))}
			</div>
		</main>
	);
};

export default Page;
