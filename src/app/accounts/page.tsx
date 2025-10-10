'use client';

import React, { useEffect, useState } from 'react';
import { Account, AppRole, User } from '../types';
import { toast } from 'sonner';
import {
	deleteAccount,
	getAllAccounts,
	toggleAccountActive,
} from '../api/accountApi';
import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { useSession } from 'next-auth/react';
import { DeleteUserButton } from '@/components/tableComponents/DeleteUserButton';
import { EditAccountDialog } from '@/components/tableComponents/EditAccountDialog';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import Spinner from '@/components/spinner/Spinner';
import { UserControls } from '@/components/tableComponents/UserControls';
import { Pagination } from '@/components/tableComponents/Pagination';

const MainAccountPage = () => {
	//icons

	//session
	const { data: session } = useSession();
	const currentUser = session?.user as User | undefined;
	const sessionUserRole = session?.user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;

	//set state
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(true);
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	//get all accounts
	useEffect(() => {
		const fetchAccounts = async () => {
			try {
				const response = await getAllAccounts();
				setAccounts(response.data || []);
			} catch (error: any) {
				toast.error('Failed to fetch accounts: ' + (error.message || error));
			} finally {
				setLoading(false);
			}
		};
		fetchAccounts();
	}, []);

	//toggle account active
	const handleToggleActive = async (accountId: string, checked: boolean) => {
		try {
			await toggleAccountActive(accountId, checked);

			setAccounts((prev) =>
				prev.map((a) =>
					a.id === accountId ? { ...a, accountActive: checked } : a
				)
			);

			const updatedAccount = accounts.find((a) => a.id === accountId);
			toast.success(
				`User: ${updatedAccount?.accountName ?? 'Unknow'} is now ${
					checked ? 'active' : 'inactive'
				}`
			);
		} catch (error: any) {
			toast.error('Failed to update user status: ' + error.message);
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
    
    //pagination
        useEffect(() => {
            localStorage.setItem('usersCurrentPage', String(currentPage));
        }, [currentPage]);
    
        useEffect(() => {
            localStorage.setItem('usersPageSize', String(pageSize));
            setCurrentPage(1); // reset to first page when pageSize changes
        }, [pageSize]);
    
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
		<main className="pt-4">
			<div className='w-3/4 flex mx-auto'>
				<h1 className="text-3xl font-bold text-center mb-4">Accounts</h1>
			</div>

			{/* table header */}
			<UserControls
				showActiveOnly={showActiveOnly}
				setShowActiveOnly={setShowActiveOnly}
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
			/>

			<div className="hidden md:block bg-accent p-4 rounded-2xl text-chart-3 w-3/4 mx-auto shadow-md mt-8">
				<ReusableTable
					data={paginatedAccounts}
					rowKey={(a) => a.id!}
					columns={[
						{
							header: 'Account Name',
							render: (a) => a.accountName,
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
										<EditAccountDialog
											account={a}
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
										{a.id && (
											<DeleteConfirmButton
												item={{ id: a.id }} // <--- wrap in object with guaranteed string id
												entityLabel="account"
												onDelete={async (id) => {
													await deleteAccount(id);
													setAccounts((prev) =>
														prev.filter((acc) => acc.id !== id)
													);
												}}
												getItemName={() => a.accountName}
											/>
										)}
									</div>
								) : (
									<span className="text-gray-400">No Actions</span>
								),
						},
					]}
				/>
			</div>
			{/* pagination page size selector */}
			<Pagination
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
				pageSize={pageSize}
				setPageSize={setPageSize}
				totalItems={filteredAccounts.length}
			/>
		</main>
	);
};

export default MainAccountPage;
