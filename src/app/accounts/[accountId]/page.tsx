'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import Spinner from '@/components/spinner/Spinner';
import LeftNav from '@/components/navBar/LeftNav';
import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { Pagination } from '@/components/tableComponents/Pagination';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { UserControls } from '@/components/tableComponents/UserControls';
import CreateLocationDialog from '@/components/tableComponents/CreateLocationForm';
import { EditLocationDialog } from '@/components/tableComponents/EditLocationDialog';
import { DataCard } from '@/components/cards/DataCard';
import { AppRole, Locations, User } from '@/app/types';
import { getAccountsForUser } from '@/app/api/accountApi';
import {
	deleteLocation,
	getLocationsByAccountId,
	getUserLocationAccess,
	toggleLocationActive,
} from '@/app/api/locationApi';
import router from 'next/router';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';

const AccountPage = () => {
	//session
	const { data: session, status } = useSession();
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountIdParam = params.accountId;

	// state
	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const currentUser = session?.user as User | undefined;
	const sessionUserRole = session?.user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;

	// verify user access
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
				const locationRes = await getLocationsByAccountId(accountIdParam);
				const fetchedLocations = locationRes.data ?? [];

				if (!location) {
					toast.error('You do not have access to this location.');
					router.push(`/accounts/${accountIdParam}/locations`);
					return;
				}

				setHasAccess(true);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || null);
				setLocations(fetchedLocations);
			} catch (err) {
				toast.error('You do not have access to this location.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session, accountIdParam, hasAccess, router]);

	// toggle active
	const handleToggleActive = async (locationId: string, checked: boolean) => {
		setLocations((prev) =>
			prev.map((loc) =>
				loc.id === locationId ? { ...loc, locationActive: checked } : loc
			)
		);

		try {
			await toggleLocationActive(locationId, checked);
		} catch (error: any) {
			setLocations((prev) =>
				prev.map((loc) =>
					loc.id === locationId ? { ...loc, locationActive: !checked } : loc
				)
			);
			toast.error('Failed to update location status.');
		}
	};

	// handle create
	const handleLocationCreated = (newLocation: Locations) => {
		setLocations((prev) => [...prev, newLocation]);
	};

	// filters
	const filteredLocations = locations.filter((loc) => {
		const name = loc.locationName?.toLowerCase() || '';
		return (
			name.includes(searchTerm.toLowerCase()) &&
			(!showActiveOnly || loc.locationActive)
		);
	});

	const paginatedLocations = filteredLocations.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	if (loadingAccess)
		return (
			<div className="flex justify-center items-center py-40 text-xl text-chart-3">
				<Spinner />
				<span className="ml-4">Loading Locations…</span>
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

						<h1 className="text-2xl font-semibold">{accountName}</h1>
					</div>

					{/* Right */}
					<CreateLocationDialog
						onLocationCreated={handleLocationCreated}
						accountId={accountIdParam}
					/>
				</header>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4">
					{loadingAccess ? (
						<div className="flex justify-center items-center h-64">
							<Spinner />
						</div>
					) : locations.length === 0 ? (
						<p className="text-destructive text-lg">
							No locations found for this account.
						</p>
					) : (
						<>
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
							<div className="hidden md:block bg-accent p-4 rounded-2xl text-chart-3 shadow-md w-3/4 mx-auto mt-6">
								<ReusableTable
									data={paginatedLocations}
									rowKey={(loc) => loc.id!}
									columns={[
										{
											header: 'Location Name',
											render: (loc) => (
												<Link
													href={`/accounts/${accountIdParam}/locations/${loc.id}`}
												>
													{loc.locationName}
												</Link>
											),
										},
										{
											header: 'Status',
											className: 'text-center',
											render: (loc) => (
												<StatusSwitchOrBadge
													entity={{
														id: loc.id!,
														active: loc.locationActive,
													}}
													getLabel={() => `Location: ${loc.locationName}`}
													onToggle={handleToggleActive}
													canToggle={canToggle}
												/>
											),
										},
										{
											header: 'Actions',
											className: 'text-center',
											render: (loc) =>
												sessionUserRole === 'MANAGER' ? (
													<div className="flex justify-center gap-4 items-center">
														<EditLocationDialog
															location={loc}
															onUpdate={(
																id,
																updatedFields: Partial<Locations>
															) => {
																setLocations((prev) =>
																	prev.map((l) =>
																		l.id === id ? { ...l, ...updatedFields } : l
																	)
																);
															}}
														/>
														{loc.id && (
															<DeleteConfirmButton
																item={{ id: loc.id }}
																entityLabel="Location"
																onDelete={async (id) => {
																	await deleteLocation(id);
																	setLocations((prev) =>
																		prev.filter((l) => l.id !== id)
																	);
																}}
																getItemName={() => loc.locationName}
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
							<div className="md:hidden mt-6 space-y-4">
								{paginatedLocations.map((loc) => (
									<DataCard
										key={loc.id}
										title={loc.locationName!}
										fields={[
											{
												label: 'Status',
												value: (
													<StatusSwitchOrBadge
														entity={{ id: loc.id!, active: loc.locationActive }}
														getLabel={() => `Location: ${loc.locationName}`}
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
																<EditLocationDialog
																	location={loc}
																	onUpdate={(
																		id,
																		updatedFields: Partial<Locations>
																	) => {
																		setLocations((prev) =>
																			prev.map((l) =>
																				l.id === id
																					? { ...l, ...updatedFields }
																					: l
																			)
																		);
																	}}
																/>

																{loc.id && (
																	<DeleteConfirmButton
																		item={{ id: loc.id }}
																		entityLabel="Location"
																		onDelete={async (id) => {
																			await deleteLocation(id);
																			setLocations((prev) =>
																				prev.filter((l) => l.id !== id)
																			);
																		}}
																		getItemName={() => loc.locationName}
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

							{/* Pagination */}
							<div className="w-full md:w-3/4 mx-auto mt-6">
								<Pagination
									currentPage={currentPage}
									setCurrentPage={setCurrentPage}
									pageSize={pageSize}
									setPageSize={setPageSize}
									totalItems={filteredLocations.length}
								/>
							</div>
						</>
					)}
				</div>
			</section>
		</main>
	);
};

export default AccountPage;
