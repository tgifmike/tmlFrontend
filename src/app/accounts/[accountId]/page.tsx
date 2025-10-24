'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import LeftNav from '@/components/navBar/LeftNav';
import { getAccountsForUser } from '@/app/api/accountApi';
import {
	getLocationsByAccountId,
	deleteLocation,
	toggleLocationActive,
} from '@/app/api/locationApi';
import { AppRole, Locations, User } from '@/app/types/index';
import Spinner from '@/components/spinner/Spinner';
import { Pagination } from '@/components/tableComponents/Pagination';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { UserControls } from '@/components/tableComponents/UserControls';
import CreateLocationDialog from '@/components/tableComponents/CreateLocationForm';
import { EditLocationDialog } from '@/components/tableComponents/EditLocationDialog';
import { DataCard } from '@/components/cards/DataCard';
import Link from 'next/link';

const AccountPage = () => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const sessionUserRole = session?.user?.appRole;
	const currentUser = session?.user as User | undefined;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	const params = useParams<{ accountId: string }>();
	const accountIdParam = params.accountId;

	// state
	const [loadingAccess, setLoadingAccess] = useState(true);
	const [loadingLocations, setLoadingLocations] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	useEffect(() => {
		if (status !== 'authenticated' || !session?.user?.id || !accountIdParam)
			return;
		if (hasAccess) return; // prevent rerun

		const verifyAccess = async () => {
			try {
				const response = await getAccountsForUser(session.user.id);
				const account = response.data?.find(
					(acc) => acc.id?.toString() === accountIdParam
				);

				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				setHasAccess(true);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || null);
			} catch (err) {
				toast.error('Failed to verify account access.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session?.user?.id, accountIdParam, router, hasAccess]);



	// fetch locations
	useEffect(() => {
		if (!hasAccess || !accountIdParam || locations.length > 0) return;

		const fetchLocations = async () => {
			try {
				const response = await getLocationsByAccountId(accountIdParam);

				setLocations(response.data || []);
			} catch (error: any) {
				toast.error('Failed to load locations: ' + (error?.message || error));
			} finally {
				setLoadingLocations(false);
			}
		};

		fetchLocations();
	}, [hasAccess, accountIdParam]);

	//toggle location active
	const handleToggleActive = async (locationId: string, checked: boolean) => {
		// Optimistically update the UI first
		setLocations((prev) =>
			prev.map((loc) =>
				loc.id === locationId ? { ...loc, locationActive: checked } : loc
			)
		);

		try {
			// Call backend to update
			await toggleLocationActive(locationId, checked);
		} catch (error: any) {
			// Rollback if API fails
			setLocations((prev) =>
				prev.map((loc) =>
					loc.id === locationId ? { ...loc, locationActive: !checked } : loc
				)
			);
			toast.error(
				'Failed to update location status: ' + (error?.message || error)
			);
		}
	};


	//pagination
	// Load pagination settings from localStorage safely
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedPage =
				Number(localStorage.getItem('accountCurrentPage')) || 1;
			const storedPageSize =
				Number(localStorage.getItem('accountPageSize')) || 10;
			setCurrentPage(storedPage);
			setPageSize(storedPageSize);
		}
	}, []);

	// Persist pagination to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('accountCurrentPage', String(currentPage));
		}
	}, [currentPage]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('accountPageSize', String(pageSize));
		}
	}, [pageSize]);

	//pagination
	useEffect(() => {
		localStorage.setItem('accountCurrentPage', String(currentPage));
	}, [currentPage]);

	useEffect(() => {
		localStorage.setItem('accountPageSize', String(pageSize));
		setCurrentPage(1); // reset to first page when pageSize changes
	}, [pageSize]);

	const handleLocationCreated = (newLocation: Locations) => {
		setLocations((prev) => [...prev, newLocation]);
		// toast.success(`Account "${newAccount.accountName}" added`);
	};

	//toggle showing only active users and search
	const filteredLocations = locations.filter((location) => {
		const locationName = location.locationName ?? '';

		const matchesSearch = locationName
			.toLowerCase()
			.includes(searchTerm.toLowerCase());

		const matchesActive = showActiveOnly ? location.locationActive : true;

		return matchesActive && matchesSearch;
	});

	// slice for current page
	const paginatedLocations = filteredLocations.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	//show loadding state
	if (loadingAccess)
		return (
			<div className="flex justify-center items-center py-40  text-chart-3 text-xl">
				<Spinner />
				<span className="ml-4">Loading Locations…</span>
			</div>
		);

	return (
		<main className="flex">
			{/* left nav */}
			<div className="w-1/6 border-r-2 bg-ring h-screen">
				<LeftNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountIdParam}
					sessionUserRole={sessionUserRole}
				/>
			</div>

			{/* main content */}
			<div className="p-4 flex-1">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold mb-4">
						Locations for {accountName}
					</h1>

					{/* create location */}
					<div className="flex justify-center sm:justify-end">
						<CreateLocationDialog
							onLocationCreated={handleLocationCreated}
							accountId={accountIdParam}
						/>
					</div>
				</div>

				{locations.length === 0 ? (
					<p className="text-destructive text-2xl">
						No locations found for this account.
					</p>
				) : (
					<div>
						<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
							<UserControls
								showActiveOnly={showActiveOnly}
								setShowActiveOnly={setShowActiveOnly}
								searchTerm={searchTerm}
								setSearchTerm={setSearchTerm}
							/>
						</div>
						<div className="hidden md:block bg-accent p-4 rounded-2xl text-chart-3 shadow-md w-3/4 mx-auto mt-8">
							<ReusableTable
								data={paginatedLocations}
								rowKey={(loc) => loc.id!}
								columns={[
									{
										header: 'Location Name',
										render: (loc) => <Link href={`/accounts/${accountIdParam}/locations/${loc.id}`}>{loc.locationName}</Link>,
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
															locationName,
															locationStreet,
															locationTown,
															locationState,
															locationZipCode,
															locationTimeZone
														) => {
															setLocations((prev) =>
																prev.map((location) =>
																	location.id === id
																		? {
																				...location,
																				locationName,
																				locationStreet: locationStreet,
																				locationTown: locationTown,
																				locationState: locationState,
																				locationZipCode: locationZipCode,
																				locationTimeZone: locationTimeZone,
																		  }
																		: location
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
																	prev.filter((loc) => loc.id !== id)
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

						{/* mobile cards */}
						<div className="md:hidden mt-8 space-y-4">
							{paginatedLocations.map((location) => (
								<DataCard
									key={location.id}
									title={location.locationName!}
									// description={accountImage ?? undefined}
									fields={[
										{
											label: 'Status',
											value: (
												<StatusSwitchOrBadge
													entity={{
														id: location.id!,
														active: location.locationActive,
													}}
													getLabel={() => `Location: ${location.locationName}`}
													onToggle={handleToggleActive}
													canToggle={canToggle}
												/>
											),
										},
									]}
									actions={[
										{
											element: (
												<EditLocationDialog
													location={location}
													onUpdate={(
														id,
														locationName,
														locationStreet,
														locationTown,
														locationState,
														locationZipCode,
														locationTimeZone
													) => {
														setLocations((prev) =>
															prev.map((location) =>
																location.id === id
																	? {
																			...location,
																			locationName,
																			locationStreet: locationStreet,
																			locationTown: locationTown,
																			locationState: locationState,
																			locationZipCode: locationZipCode,
																			locationTimeZone: locationTimeZone,
																	  }
																	: location
															)
														);
													}}
												/>
											),
										},
										{
											element: location.id ? (
												<DeleteConfirmButton
															item={{ id: location.id }}
															entityLabel="Location"
															onDelete={async (id) => {
																await deleteLocation(id);
																setLocations((prev) =>
																	prev.filter((loc) => loc.id !== id)
																);
															}}
															getItemName={() => location.locationName}
														/>
											) : null,
										}
									]}
								/>
							))}
						</div>
					</div>
				)}

				{/* pagination page size selector */}
				<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
					<Pagination
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
						pageSize={pageSize}
						setPageSize={setPageSize}
						totalItems={locations.length}
					/>
				</div>
			</div>
		</main>
	);
};

export default AccountPage;
