'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronRight, MapPin } from 'lucide-react';
import Spinner from '@/components/spinner/Spinner';
import LeftNav from '@/components/navBar/LeftNav';
import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { Pagination } from '@/components/tableComponents/Pagination';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { UserControls } from '@/components/tableComponents/UserControls';
import CreateLocationDialog from '@/components/tableComponents/CreateLocationForm';
import { EditLocationDialog } from '@/components/tableComponents/EditLocationDialog';
import { Card } from '@/components/ui/card';
import { AccessRole, AppRole, Locations, User } from '@/app/types';
import { getAccountsForUser } from '@/app/api/accountApi';
import {
	deleteLocation,
	getLocationsByAccountId,
	toggleLocationActive,
	updateLocation,
} from '@/app/api/locationApi';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';
import LocationHistoryFeed from '@/components/tableComponents/LocationHistoryFeed';
import { useSession } from '@/lib/auth/session-context';


const AccountPage = () => {
	const { user } = useSession();
	const router = useRouter();
	
	const params = useParams<{ accountId: string }>();
	const accountIdParam = params.accountId;

	const [loadingAccess, setLoadingAccess] = useState(true);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [showActiveOnly, setShowActiveOnly] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const currentUser = user as User | undefined;
	const sessionUserRole = user?.appRole;
	const MANAGER = currentUser?.appRole === AppRole.MANAGER;
	const SRADMIN = currentUser?.accessRole === AccessRole.SRADMIN;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	const userId = currentUser?.id;

	useEffect(() => {
		if (!userId || !accountIdParam) return;
		

		const verifyAccess = async () => {
			try {
				const accountsRes = await getAccountsForUser(userId);
				const account = accountsRes.data?.find(
					(acc) => acc.id?.toString() === accountIdParam
				);
				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				const locationRes = await getLocationsByAccountId(accountIdParam);
				const fetchedLocations = locationRes.data ?? [];

				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || account.accountImage || null);
				setLocations(fetchedLocations);
			} catch (err) {
				toast.error('You do not have access to this account.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [userId, accountIdParam, router]);

	// Toggle active
	const handleToggleActive = async (locationId: string, checked: boolean) => {
		if (!userId) return;
		setLocations((prev) =>
			prev.map((loc) =>
				loc.id === locationId ? { ...loc, locationActive: checked } : loc
			)
		);

		try {
			await toggleLocationActive(locationId, checked, userId);
		} catch {
			setLocations((prev) =>
				prev.map((loc) =>
					loc.id === locationId ? { ...loc, locationActive: !checked } : loc
				)
			);
			toast.error('Failed to update location status.');
		}
	};

	// Delete location
	const handleDeleteLocation = async (locationId: string) => {
		if (!userId) return;
		await deleteLocation(locationId, userId);
		setLocations((prev) => prev.filter((l) => l.id !== locationId));
	};

	// Update location
const handleUpdateLocation = async (
	id: string,
	updatedFields: Partial<Locations>
) => {
	if (!userId) return;

	try {
		const response = await updateLocation(id, userId, updatedFields);
		const updated = response.data;

		if (!updated) {
			toast.error('Failed to update location.');
			return;
		}

		setLocations((prev) => prev.map((l) => (l.id === id ? updated : l)));

		toast.success(`Location ${updated.locationName} updated successfully.`);
	} catch (error: any) {
		toast.error(error?.message || 'Failed to update location.');
	}
};


	//handel create
	const handleLocationCreated = (newLocation: Locations) => {
		setLocations((prev) => [...prev, newLocation]);
		toast.success(`Location ${newLocation.locationName} added successfully.`);
	};


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
			<div className="flex items-center justify-center py-40 text-xl text-chart-3">
				<Spinner />
				<span className="ml-4">Loading locations…</span>
			</div>
		);

	return (
		<div className="flex flex-1 min-w-0">
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
					<div className="flex gap-8">
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

						{/* <h1 className="text-2xl font-semibold">
							Location's for {accountName}
						</h1> */}
						<h1 className="text-2xl font-semibold">
							Location List:
						</h1>
					</div>

					<CreateLocationDialog
						onLocationCreated={handleLocationCreated}
						accountId={accountIdParam}
						userId={userId!}
					/>
				</header>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4">
					{locations.length === 0 ? (
						<p className="text-destructive text-lg">
							No locations found for this account.
						</p>
					) : (
						<>
							{/* Controls */}
							<div className="mx-auto mt-2 w-full max-w-6xl">
								<UserControls
									showActiveOnly={showActiveOnly}
									setShowActiveOnly={setShowActiveOnly}
									searchTerm={searchTerm}
									setSearchTerm={setSearchTerm}
									searchPlaceholder="Search locations"
								/>
							</div>

							{/* Desktop Table */}
							<div className="mx-auto mt-6 hidden w-full max-w-6xl overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
								<ReusableTable
									data={paginatedLocations}
									rowKey={(loc) => loc.id!}
									headerRowClassName="bg-muted/60 text-xs font-semibold uppercase tracking-[0.12em]"
									rowClassName="h-20 text-base hover:bg-muted/40"
									emptyMessage={
										searchTerm
											? `No locations match “${searchTerm}”.`
											: 'No locations to display.'
									}
									columns={[
										{
											header: 'Location Name',
											className: 'w-[60%] px-6',
											render: (loc) => (
												<Link
													href={`/accounts/${accountIdParam}/locations/${loc.id}`}
													className="group inline-flex items-center gap-3 font-semibold text-foreground transition-colors hover:text-chart-3"
												>
													<span className="flex size-10 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3 transition-colors group-hover:bg-chart-3 group-hover:text-white">
														<MapPin className="size-5" aria-hidden="true" />
													</span>
													<span>{loc.locationName}</span>
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
											render: (loc) => (
												<div className="flex flex-col items-center justify-center gap-1.5">
													<StatusSwitchOrBadge
														entity={{ id: loc.id!, active: loc.locationActive }}
														getLabel={() => `Location: ${loc.locationName}`}
														onToggle={handleToggleActive}
														canToggle={canToggle}
													/>
													{canToggle && (
														<span className="text-xs font-medium text-muted-foreground">
															{loc.locationActive ? 'Active' : 'Inactive'}
														</span>
													)}
												</div>
											),
										},
										{
											header: 'Actions',
											className: 'w-[20%] px-6 text-center',
											render: (loc) =>
												sessionUserRole === 'MANAGER' ? (
													<div className="flex justify-center gap-4 items-center">
														<EditLocationDialog
															location={loc}
															onUpdate={handleUpdateLocation}
															userId={userId!}
														/>
														{loc.id && (
															<DeleteConfirmButton
																item={{ id: loc.id }}
																entityLabel="Location"
																onDelete={() => handleDeleteLocation(loc.id!)}
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
							<div className="mt-6 space-y-4 md:hidden">
								{paginatedLocations.map((loc) => (
									<Card
										key={loc.id}
										className="gap-0 overflow-hidden py-0 shadow-sm"
									>
										<Link
											href={`/accounts/${accountIdParam}/locations/${loc.id}`}
											className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-chart-3/10"
										>
											<div className="flex min-w-0 items-center gap-3">
												<span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3 transition-colors group-hover:bg-chart-3 group-hover:text-white">
													<MapPin className="size-5" aria-hidden="true" />
												</span>
												<div className="min-w-0">
													<p className="truncate font-semibold text-foreground transition-colors group-hover:text-chart-3">
														{loc.locationName}
													</p>
													<p className="mt-1 text-xs text-muted-foreground">
														View location dashboard
													</p>
												</div>
											</div>
											<ChevronRight
												className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-chart-3"
												aria-hidden="true"
											/>
										</Link>

										<div className="flex items-center justify-between border-t bg-muted/20 px-5 py-4">
											<span className="text-sm font-medium text-muted-foreground">
												Status
											</span>
											<div className="flex items-center gap-3">
												<StatusSwitchOrBadge
													entity={{ id: loc.id!, active: loc.locationActive }}
													getLabel={() => `Location: ${loc.locationName}`}
													onToggle={handleToggleActive}
													canToggle={canToggle}
												/>
												{canToggle && (
													<span className="text-sm font-medium">
														{loc.locationActive ? 'Active' : 'Inactive'}
													</span>
												)}
											</div>
										</div>

										{sessionUserRole === 'MANAGER' && (
											<div className="flex items-center justify-between border-t px-5 py-2">
												<span className="text-sm font-medium text-muted-foreground">
													Manage location
												</span>
												<div className="flex items-center gap-1">
													<EditLocationDialog
														location={loc}
														onUpdate={handleUpdateLocation}
														userId={userId!}
													/>
													{loc.id && (
														<DeleteConfirmButton
															item={{ id: loc.id }}
															entityLabel="Location"
															onDelete={() => handleDeleteLocation(loc.id!)}
															getItemName={() => loc.locationName}
														/>
													)}
												</div>
											</div>
										)}
									</Card>
								))}

								{paginatedLocations.length === 0 && (
									<div className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
										{searchTerm
											? `No locations match “${searchTerm}”.`
											: 'No locations to display.'}
									</div>
								)}
							</div>

							{/* Pagination */}
							<div className="mx-auto mt-6 w-full max-w-6xl">
								<Pagination
									currentPage={currentPage}
									setCurrentPage={setCurrentPage}
									pageSize={pageSize}
									setPageSize={setPageSize}
									totalItems={filteredLocations.length}
								/>
							</div>

							<div className="flex justify-center items-center">
								{(SRADMIN || MANAGER) && (
									<LocationHistoryFeed accountId={accountIdParam} />
								)}
							</div>
						</>
					)}
				</div>
			</section>
		</div>
	);
};

export default AccountPage;
