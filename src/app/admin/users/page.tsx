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
import { Pencil, Trash2, UserRound } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { getAllUsers, toggleUserActive, updateUserAccessRole, updateUserAppRole } from '@/app/api/userApI';
import { toast } from 'sonner';
import { AccessRole, AppRole, User } from '@/app/types';
import { UserStatusSwitch } from '@/components/tableComponents/UserStatusSwitch';
import { AccessRoleSelect } from '@/components/tableComponents/AccessRoleSelect';
import { AppRoleSelect } from '@/components/tableComponents/AppRoleSelect';
import { DeleteUserButton } from '@/components/tableComponents/DeleteUserButton';

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
    
    //
    const handleAppRoleChange = async (
        userId: string,
        newRole: AppRole
    ) => { 
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
    }

    //show loadding state
	if (loading) return <p>Loading...</p>;

	return (
		<main className="p-4">
			<h1 className="text-4xl font-bold mb-4">Users</h1>
			<Link href="/" className="text-blue-600 underline">
				Home
			</Link>

			{/* Desktop Table */}
			<div className="hidden md:block mt-8 bg-accent p-4 rounded-2xl text-chart-3 w-3/4 mx-auto">
				<Table className="min-w-full">
					<TableHeader>
						<TableRow className="text-lg font-semibold uppercase">
							<TableHead></TableHead>
							<TableHead>User Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead className="text-center">Status</TableHead>
							<TableHead>Access Role</TableHead>
							<TableHead>App Role</TableHead>
							<TableHead className="text-center">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user.id} className="text-md">
								<TableCell>
									<Avatar>
										<AvatarImage src={user.userImage ?? undefined} />
										<AvatarFallback>
											<UserRound className="h-5 w-5 text-chart-3" />
										</AvatarFallback>
									</Avatar>
								</TableCell>
								<TableCell>{user.userName}</TableCell>
								<TableCell>{user.userEmail}</TableCell>
								<TableCell className="flex justify-center">
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
								</TableCell>
								<TableCell>
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
								</TableCell>
								<TableCell>
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
								</TableCell>
								<TableCell className="flex justify-center gap-4 items-center">
									<Pencil className="text-chart-2 cursor-pointer" />
									<DeleteUserButton
										user={user}
										onDelete={(id) =>
											setUsers((prev) => prev.filter((u) => u.id !== id))
										}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Mobile Cards */}
			<div className="block md:hidden mt-6 space-y-4 text-chart-3">
				{users.map((user) => (
					<div
						key={user.id}
						className="p-4 border rounded-xl bg-accent space-y-3"
					>
						<div className="flex items-center gap-3">
							<Avatar>
								<AvatarImage src={user.userImage ?? undefined} />
								<AvatarFallback>
									<UserRound className="h-5 w-5 text-chart-3" />
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-semibold">{user.userName}</p>
								<p className="text-sm text-muted-foreground">
									{user.userEmail}
								</p>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<div className="flex justify-between text-sm">
								<span>Status</span>
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
							</div>
							<div className="flex justify-between items-center text-sm">
								<span>Access Role</span>
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
							</div>
							<div className="flex justify-between items-center text-sm">
								<span>App Role</span>
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
							</div>
							<div className="flex justify-center gap-4 mt-2">
								<Pencil className="text-chart-2 cursor-pointer" />
								<DeleteUserButton
									user={user}
									onDelete={(id) =>
										setUsers((prev) => prev.filter((u) => u.id !== id))
									}
								/>
							</div>
						</div>
					</div>
				))}
			</div>
		</main>
	);
};

export default Page;
