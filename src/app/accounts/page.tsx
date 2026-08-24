'use client';

import React, { useEffect, useState } from 'react';
import { AccessRole, Account, AccountHistory, AppRole, User } from '../types';
import { toast } from 'sonner';
import {
	deleteAccount,
	getAccountsForUser,
	toggleAccountActive,
} from '../api/accountApi';
import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { EditAccountDialog } from '@/components/tableComponents/EditAccountDialog';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { UserControls } from '@/components/tableComponents/UserControls';
import { Pagination } from '@/components/tableComponents/Pagination';
import CreateAccountDialog from '@/components/tableComponents/CreateAccountForm';
import Link from 'next/link';
import AccountHistoryFeed from '@/components/tableComponents/AccountHistoryFeed';
import { useSession } from '@/lib/auth/session-context';
import { Building2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';



const MainAccountPage = () => {
	//icons

	//session
	const { user, loading } = useSession();
	const currentUser = user as User | undefined;
	const sessionUserRole = user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	const SRADMIN = currentUser?.accessRole === AccessRole.SRADMIN;

	//set state
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [showActiveOnly, setShowActiveOnly] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [accountHistoryUpdates, setAccountHistoryUpdates] = useState<
		AccountHistory[]
	>([]);


	useEffect(() => {
		// Only fetch if session is loaded and user id exists
		if (user?.id) {
			const fetchAccounts = async () => {
				try {
					const response = await getAccountsForUser(user.id);
					setAccounts(response.data || []);
				} catch (error: any) {
					toast.error('Failed to fetch accounts: ' + (error.message || error));
				} finally {
					// setLoading(false);
				}
			};
			fetchAccounts();
		} else if (loading) {
			// Session failed or no user
			// setLoading(false);
		}
	}, [loading, user]);

	//toggle account active
	const handleToggleActive = async (accountId: string, checked: boolean) => {
		// if (!currentUser?.id || !currentUser?.userName) {
		// 	throw new Error('User not authenticated'); // let StatusSwitchOrBadge handle toast
		// }

		// Optimistically update UI
		setAccounts((prev) =>
			prev.map((a) =>
				a.id === accountId ? { ...a, accountActive: checked } : a
			)
		);

		try {
			const { error } = await toggleAccountActive(
				accountId,
				checked,
				user?.id!,
				user?.name!
				// currentUser.id,
				// currentUser.userName
			);

			if (error) {
				// Rollback UI change if API fails
				setAccounts((prev) =>
					prev.map((a) =>
						a.id === accountId ? { ...a, accountActive: !checked } : a
					)
				);
				throw new Error(error);
			}
		} catch (err: any) {
			throw new Error(err?.message || 'Failed to update account');
		}
	};

	//toggle showing only active users and search
	const filteredAccounts = accounts.filter((account) => {
		const accountName = account.accountName ?? '';

		const matchesSearch = accountName
			.toLowerCase()
			.includes(searchTerm.toLowerCase());

		const matchesActive = showActiveOnly ? account.accountActive : true;

		return matchesActive && matchesSearch;
	});

	// Load pagination settings from localStorage safely
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedPage =
				Number(localStorage.getItem('mainAccountCurrentPage')) || 1;
			const storedPageSize =
				Number(localStorage.getItem('mainAccountPageSize')) || 10;
			setCurrentPage(storedPage);
			setPageSize(storedPageSize);
		}
	}, []);

	// Persist pagination to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('mainAccountCurrentPage', String(currentPage));
		}
	}, [currentPage]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('mainAccountPageSize', String(pageSize));
		}
	}, [pageSize]);

	useEffect(() => {
		setCurrentPage(1); // reset to first page when pageSize changes
	}, [pageSize]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, showActiveOnly]);

	const handleAccountCreated = (newAccount: Account) => {
		setAccounts((prev) => [...prev, newAccount]);
		// toast.success(`Account "${newAccount.accountName}" added`);
	};

	// slice for current page
	const paginatedAccounts = filteredAccounts.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	

	return (
		<div className="px-4 py-8 sm:px-6 lg:px-8">
			<div className="mx-auto w-full max-w-7xl">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
					Accounts
				</h1>

				<div className="flex justify-center sm:justify-end">
					<CreateAccountDialog onAccountCreated={handleAccountCreated} />
				</div>
			</div>

			{/* table header */}
			<div className="mt-6 w-full">
				<UserControls
					showActiveOnly={showActiveOnly}
					setShowActiveOnly={setShowActiveOnly}
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					searchPlaceholder="Search accounts"
				/>
			</div>

			<div className="mt-6 hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
				<ReusableTable
					data={paginatedAccounts}
					rowKey={(a) => a.id!}
					headerRowClassName="bg-muted/60 text-xs font-semibold uppercase tracking-[0.12em]"
					rowClassName="h-20 text-base hover:bg-muted/40"
					emptyMessage={
						searchTerm
							? `No accounts match “${searchTerm}”.`
							: 'No accounts to display.'
					}
					columns={[
						{
							header: 'Account Name',
							className: 'w-[60%] px-6',
							render: (a) => (
								<Link
									href={`/accounts/${a.id}`}
									className="group inline-flex items-center gap-3 font-semibold text-foreground transition-colors hover:text-chart-3"
								>
									<span className="flex size-10 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
										<Building2 className="size-5" aria-hidden="true" />
									</span>
									<span>{a.accountName}</span>
									<ChevronRight
										className="size-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
										aria-hidden="true"
									/>
								</Link>
							),
						},
						{
							header: 'Status',
							className: 'w-[20%] px-4 text-center',
							render: (a) => (
								<div className="flex flex-col items-center justify-center gap-1.5">
									<StatusSwitchOrBadge
										entity={{
											id: a.id!,
											active: a.accountActive!,
										}}
										getLabel={() => `Account: ${a.accountName}`}
										onToggle={handleToggleActive}
										canToggle={canToggle}
									/>
									{canToggle && (
										<span className="text-xs font-medium text-muted-foreground">
											{a.accountActive ? 'Active' : 'Inactive'}
										</span>
									)}
								</div>
							),
						},
						{
							header: 'Actions',
							className: 'w-[20%] px-6 text-center',
							render: (a) =>
								sessionUserRole === 'MANAGER' ? (
									<div className="flex justify-center gap-4 items-center">
										{currentUser?.id && (
											<EditAccountDialog
												account={a}
												userId={currentUser.id}
												onUpdate={(id, name) =>
													setAccounts((prev) =>
														prev.map((account) =>
															account.id === id
																? { ...account, accountName: name }
																: account
														)
													)
												}
											/>
										)}

										{a.id && (
											<DeleteConfirmButton
												item={{ id: a.id }}
												entityLabel="account"
												onDelete={async (id) => {
													if (!currentUser?.id) {
														toast.error('User not authenticated');
														return;
													}

													await deleteAccount(id, currentUser.id);
													setAccounts((prev) =>
														prev.filter((acc) => acc.id !== id)
													);
												}}
												getItemName={() => a.accountName}
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
			<div className="mt-6 space-y-4 md:hidden">
				{paginatedAccounts.map((account) => (
					<Card key={account.id} className="gap-0 overflow-hidden py-0 shadow-sm">
						<Link
							href={`/accounts/${account.id}`}
							className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/40"
						>
							<div className="flex min-w-0 items-center gap-3">
								<span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
									<Building2 className="size-5" aria-hidden="true" />
								</span>
								<div className="min-w-0">
									<p className="truncate font-semibold text-foreground">
										{account.accountName}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										View account details
									</p>
								</div>
							</div>
							<ChevronRight
								className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
								aria-hidden="true"
							/>
						</Link>

						<div className="flex items-center justify-between border-t bg-muted/20 px-5 py-4">
							<span className="text-sm font-medium text-muted-foreground">Status</span>
							<div className="flex items-center gap-3">
									<StatusSwitchOrBadge
										entity={{
											id: account.id!,
											active: account.accountActive!,
										}}
										getLabel={() => `Account: ${account.accountName}`}
										onToggle={handleToggleActive}
										canToggle={canToggle}
									/>
								{canToggle && (
									<span className="text-sm font-medium">
										{account.accountActive ? 'Active' : 'Inactive'}
									</span>
								)}
							</div>
						</div>

						{sessionUserRole === 'MANAGER' && (
							<div className="flex items-center justify-between border-t px-5 py-2">
								<span className="text-sm font-medium text-muted-foreground">
									Manage account
								</span>
								<div className="flex items-center gap-1">
												<EditAccountDialog
													account={account}
													accounts={accounts}
													userId={currentUser?.id!} // <-- pass the UUID from session
													onUpdate={(id, name) =>
														setAccounts((prev) =>
															prev.map((account) =>
																account.id === id
																	? { ...account, accountName: name }
																	: account
															)
														)
													}
												/>

												{account.id !== undefined && (
													<DeleteConfirmButton
														item={{ id: account.id }}
														entityLabel="account"
														onDelete={async (id) => {
															if (!currentUser?.id) {
																toast.error('User not authenticated');
																return;
															}

															await deleteAccount(id, currentUser.id);
															setAccounts((prev) =>
																prev.filter((a) => a.id !== id)
															);
														}}
														getItemName={() => account.accountName ?? 'unknown'}
													/>
												)}
								</div>
							</div>
						)}
					</Card>
				))}

				{paginatedAccounts.length === 0 && (
					<div className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
						{searchTerm
							? `No accounts match “${searchTerm}”.`
							: 'No accounts to display.'}
					</div>
				)}
			</div>

			{/* pagination page size selector */}
			<div className="mt-2 w-full">
				<Pagination
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
					pageSize={pageSize}
					setPageSize={setPageSize}
					totalItems={filteredAccounts.length}
				/>
			</div>

			<div className="flex justify-center items-center">
				{SRADMIN && <AccountHistoryFeed updates={accountHistoryUpdates} />}
			</div>
			</div>
		</div>
	);
};

export default MainAccountPage;
