'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import { deleteUser, getUsersForAccount, toggleUserActive } from '@/app/api/userApI';
import { AppRole, User } from '@/app/types';
import { DataCard } from '@/components/cards/DataCard';
import LeftNav from '@/components/navBar/LeftNav';
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
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { Menu, UserIcon, Users, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { boolean } from 'zod';

const AccountUsersPage = () => {
	//icons

	//session
	const { data: session, status } = useSession();
	const currentUser = session?.user as User | undefined;
	const sessionUserRole = session?.user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	const router = useRouter();
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountIdParam = params.accountId;

	//set state
	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [accountUsers, setAccountUsers] = useState<User[]>([]);
	const [showActiveOnly, setShowActiveOnly] = useState(false);
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
				setAccountUsers(fetchedUsers);
			} catch (err) {
				toast.error('You do not have access to this location.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session, accountIdParam, hasAccess, router]);

	//toggle active
	const handleToggleActive = async (userId: string, checked: boolean) => {
		try {
			await toggleUserActive(userId, checked);
			setAccountUsers((prev) =>
				prev.map((u) => (u.id === userId ? { ...u, userActive: checked } : u))
			);
			const updatedUser = accountUsers.find((u) => u.id === userId);
		} catch (error: any) {
			toast.error(`Failed to update user status: ` + error.message);
		}
	};

	// Load pagination settings from localStorage safely
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedPage = Number(localStorage.getItem('accountUserPage')) || 1;
			const storedPageSize =
				Number(localStorage.getItem('accountUserPageSize')) || 10;
			setCurrentPage(storedPage);
			setPageSize(storedPageSize);
		}
	}, []);

	// Persist pagination to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('accountUserCurrentPage', String(currentPage));
		}
	}, [currentPage]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('accountUserPageSize', String(pageSize));
		}
	}, [pageSize]);

	//pagination
	useEffect(() => {
		localStorage.setItem('accountUserCurrentPage', String(currentPage));
	}, [currentPage]);

	useEffect(() => {
		localStorage.setItem('accountUserPageSize', String(pageSize));
		setCurrentPage(1); // reset to first page when pageSize changes
	}, [pageSize]);

	//toggle shoiwn gonly active and search
	const filteredUsers = accountUsers.filter((user) => {
		const userName = user.userName ?? '';

		const matchesSearch = userName
			.toLowerCase()
			.includes(searchTerm.toLowerCase());

		const matchesActive = showActiveOnly ? user.userActive : true;

		return matchesActive && matchesSearch;
	});

	// slice for current page
	const paginatedUsers = filteredUsers.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	//show loadding state
	if (loadingAccess)
		return (
			<div className="flex justify-center items-center py-40  text-chart-3 text-xl">
				<Spinner />
				<span className="ml-4">Loading Accounts…</span>
			</div>
		);

	return (
		<main className="flex min-h-screen overflow-hidden">
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
					<div className="flex items-center gap-3">
						{/* Mobile Drawer */}
						<Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
							<DrawerTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="md:hidden"
									aria-label="Open menu"
								>
									<Menu className="w-6 h-6" />
								</Button>
							</DrawerTrigger>

							<DrawerContent
								side="left"
								className="p-0 w-64 backdrop-blur-xl bg-background/80 shadow-lg"
							>
								<DrawerHeader className="flex justify-between items-center rounded-2xl pt-0 ">
									<div className="flex justify-between items-center">
										<DrawerTitle>Navigation</DrawerTitle>
										<DrawerClose asChild>
											<Button variant="ghost" size="icon">
												<X className="w-5 h-5" />
											</Button>
										</DrawerClose>
									</div>
								</DrawerHeader>

								<div className="pt-0">
									<LeftNav
										accountName={accountName}
										accountImage={accountImage}
										accountId={accountIdParam}
										sessionUserRole={sessionUserRole ?? undefined}
									/>
								</div>
							</DrawerContent>
						</Drawer>

						<h1 className="text-2xl font-semibold">{accountName}</h1>
					</div>
				</header>

				{/* Content */}
				{Users.length === 0 ? (
					<p className="text-destructive text-lg">
						No locations found for this account.
					</p>
				) : (
					<div>
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
													setAccountUsers((prev) =>
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
													setAccountUsers((prev) =>
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
														users={accountUsers}
														user={u}
														onUpdate={(id, name, email) =>
															setAccountUsers((prev) =>
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
																setAccountUsers((prev) =>
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
																		setAccountUsers((prev) =>
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
																		setAccountUsers((prev) =>
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
																		setAccountUsers((prev) =>
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
																	users={accountUsers}
																	user={user}
																	onUpdate={(id, name, email) =>
																		setAccountUsers((prev) =>
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
																		setAccountUsers((prev) => prev.filter((u) => u.id !== id));
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
					</div>
				)}
			</section>

			{/* {accountUsers.map((user) => (
				<div>{user.userName}</div>
			))} */}
		</main>
	);
};

export default AccountUsersPage;
