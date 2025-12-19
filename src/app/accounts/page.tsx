'use client';

import React, { useEffect, useState } from 'react';
import { AccessRole, Account, AppRole, User } from '../types';
import { toast } from 'sonner';
import {
	deleteAccount,
	getAccountsForUser,
	toggleAccountActive,
} from '../api/accountApi';
import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { useSession } from 'next-auth/react';
import { EditAccountDialog } from '@/components/tableComponents/EditAccountDialog';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import Spinner from '@/components/spinner/Spinner';
import { UserControls } from '@/components/tableComponents/UserControls';
import { Pagination } from '@/components/tableComponents/Pagination';
import CreateAccountDialog from '@/components/tableComponents/CreateAccountForm';
import { DataCard } from '@/components/cards/DataCard';
import Link from 'next/link';
import AccountHistoryFeed from '@/components/tableComponents/AccountHistoryFeed';


const MainAccountPage = () => {
	//icons

	//session
	const { data: session, status } = useSession();
	const currentUser = session?.user as User | undefined;
	const sessionUserRole = session?.user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	const SRADMIN = currentUser?.accessRole === AccessRole.SRADMIN;

	//set state
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(true);
	const [showActiveOnly, setShowActiveOnly] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	useEffect(() => {
		// Only fetch if session is loaded and user id exists
		if (status === 'authenticated' && session?.user?.id) {
			const fetchAccounts = async () => {
				try {
					const response = await getAccountsForUser(session.user.id);
					setAccounts(response.data || []);
				} catch (error: any) {
					toast.error('Failed to fetch accounts: ' + (error.message || error));
				} finally {
					setLoading(false);
				}
			};
			fetchAccounts();
		} else if (status !== 'loading') {
			// Session failed or no user
			setLoading(false);
		}
	}, [status, session]);

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
				session?.user?.id!,
				session?.user?.name!
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

	//pagination
	useEffect(() => {
		localStorage.setItem('mainAccountCurrentPage', String(currentPage));
	}, [currentPage]);

	useEffect(() => {
		localStorage.setItem('mainAccountPageSize', String(pageSize));
		setCurrentPage(1); // reset to first page when pageSize changes
	}, [pageSize]);

	const handleAccountCreated = (newAccount: Account) => {
		setAccounts((prev) => [...prev, newAccount]);
		// toast.success(`Account "${newAccount.accountName}" added`);
	};

	// slice for current page
	const paginatedAccounts = filteredAccounts.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	//show loadding state
	if (loading || accounts == null)
		return (
			<div className="flex justify-center items-center py-40  text-chart-3 text-xl">
				<Spinner />
				<span className="ml-4">Loading Accounts…</span>
			</div>
		);

	return (
		<div className="pt-4">
			<div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4">
				<h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
					Accounts
				</h1>

				<div className="flex justify-center sm:justify-end">
					<CreateAccountDialog onAccountCreated={handleAccountCreated} />
				</div>
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

			<div className="hidden md:block bg-accent p-4 rounded-2xl text-chart-3 w-3/4 mx-auto shadow-md mt-8">
				<ReusableTable
					data={paginatedAccounts}
					rowKey={(a) => a.id!}
					columns={[
						{
							header: 'Account Name',
							render: (a) => (
								<Link href={`/accounts/${a.id}`}>{a.accountName}</Link>
							),
						},
						{
							header: 'Status',
							className: 'text-center',
							render: (a) => (
								<StatusSwitchOrBadge
									entity={{
										id: a.id!,
										active: a.accountActive!,
									}}
									getLabel={() => `Account: ${a.accountName}`}
									onToggle={handleToggleActive}
									canToggle={canToggle}
								/>
							),
						},
						{
							header: 'Actions',
							className: 'text-center',
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
			<div className="block md:hidden mt-6 space-y-4 p-2">
				{paginatedAccounts.map((account) => (
					<DataCard
						key={account.id}
						title={
							<Link href={`/accounts/${account.id}`}>
								{account.accountName}
							</Link>
						}
						description={account.accountImage ?? undefined}
						fields={[
							{
								label: 'Status',
								value: (
									<StatusSwitchOrBadge
										entity={{
											id: account.id!,
											active: account.accountActive!,
										}}
										getLabel={() => `Account: ${account.accountName}`}
										onToggle={handleToggleActive}
										canToggle={canToggle}
									/>
								),
							},
						]}
						actions={[
							{
								element: (
									<div className="flex justify-center gap-4 items-center">
										{sessionUserRole === 'MANAGER' ? (
											<>
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
											</>
										) : (
											<span className="text-ring">No Actions</span>
										)}
									</div>
								),
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
					totalItems={filteredAccounts.length}
				/>
			</div>

			<div className='flex justify-center items-center'>
				{SRADMIN && <AccountHistoryFeed />}
				
			</div>
		</div>
	);
};

export default MainAccountPage;
