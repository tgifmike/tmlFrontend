'use client';

import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
import { getAccountsForUser } from '@/app/api/accountApi';
import { deleteLocation, getUserLocationAccess } from '@/app/api/locationApi';
import { deleteStation, getAllStations, getStationsByLocation, toggleStationActive } from '@/app/api/stationApi';
import { AppRole, Locations, Station, User } from '@/app/types';
import LocationNav from '@/components/navBar/LocationNav';
import Spinner from '@/components/spinner/Spinner';
import CreateStationDialog from '@/components/tableComponents/CreateStationForm';
import { UserControls } from '@/components/tableComponents/UserControls';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { Button } from '@/components/ui/button';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { Pagination } from '@/components/tableComponents/Pagination';
import { EditStationDialog } from '@/components/tableComponents/EditStationDialog';

const LocationStationsPage = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const params = useParams<{ accountId: string; locationId: string }>();

	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;

	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [stations, setStations] = useState<Station[]>([]);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(
		null
	);
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const currentUser = session?.user as User | undefined;
	const sessionUserRole = session?.user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;

	useEffect(() => {
		if (
			status !== 'authenticated' ||
			!session?.user?.id ||
			!accountIdParam ||
			!locationIdParam
		)
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
				const locationRes = await getUserLocationAccess(session.user.id);
				const fetchedLocations = locationRes.data ?? [];
				setLocations(fetchedLocations);

				const location = fetchedLocations.find(
					(loc) => loc.id?.toString() === locationIdParam
				);
				if (!location) {
					toast.error('You do not have access to this location.');
					router.push(`/accounts/${accountIdParam}/locations`);
					return;
				}

				//fetch stations
				const stationRes = await getStationsByLocation(locationIdParam);
				const fetchedStations = stationRes.data ?? [];
				setStations(fetchedStations);

				setHasAccess(true);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || null);
				setCurrentLocation(location);
			} catch (err) {
				toast.error('You do not have access to this location.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session, accountIdParam, locationIdParam, hasAccess, router]);

	//toggle station active
	const handleToggleActive = async (stationId: string, checked: boolean) => {
		setStations((prev) =>
			prev.map((station) =>
				station.id === stationId
					? { ...station, stationActive: checked }
					: station
			)
		);

		try {
			await toggleStationActive(locationIdParam, stationId, checked);
		} catch (error: any) {
			setStations((prev) =>
				prev.map((station) =>
					station.id === stationId
						? { ...station, stationActive: !checked }
						: station
				)
			);
			toast.error(
				`Failed to update location status: ` + (error?.message || error)
			);
		}
	};

	//pagination
	// Load pagination settings from localStorage safely
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedPage =
				Number(localStorage.getItem('stationCurrentPage')) || 1;
			const storedPageSize =
				Number(localStorage.getItem('stationPageSize')) || 10;
			setCurrentPage(storedPage);
			setPageSize(storedPageSize);
		}
	}, []);

	// Persist pagination to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('stationCurrentPage', String(currentPage));
		}
	}, [currentPage]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('stationPageSize', String(pageSize));
		}
	}, [pageSize]);

	//pagination
	useEffect(() => {
		localStorage.setItem('stationCurrentPage', String(currentPage));
	}, [currentPage]);

	useEffect(() => {
		localStorage.setItem('stationPageSize', String(pageSize));
		setCurrentPage(1); // reset to first page when pageSize changes
	}, [pageSize]);

	const handleStationCreated = (newStation: Station) => {
		setStations((prev) => [...prev, newStation]);
		// toast.success(`Account "${newAccount.accountName}" added`);
	};

	//toggle showing only active users and search
	const filteredStations = stations.filter((station) => {
		const stationName = station.stationName ?? '';

		const matchesSearch = stationName
			.toLowerCase()
			.includes(searchTerm.toLowerCase());

		const matchesActive = showActiveOnly ? station.stationActive : true;

		return matchesActive && matchesSearch;
	});

	// slice for current page
	const paginatedStations = filteredStations.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	if (status === 'loading' || loadingAccess) {
		return (
			<div className="flex justify-center items-center py-40 text-chart-3 text-xl">
				<Spinner />
				<span className="ml-4">Loading Stations…</span>
			</div>
		);
	}

	return (
		<main className="flex">
			<div className="w-1/6 border-r-2 bg-ring h-screen">
				<LocationNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountIdParam}
					locationId={locationIdParam}
					sessionUserRole={sessionUserRole}
				/>
			</div>

			<div className="p-4 flex-1">
				<div className="flex justify-between items-center">
					<div className="flex">
						<h1 className="text-3xl font-bold mb-4">
							{currentLocation?.locationName}
						</h1>
					</div>

					<div>
						<p className="text-2xl">Station List:</p>
					</div>
					<div>
						<CreateStationDialog
							onStationCreated={handleStationCreated}
							locationId={locationIdParam}
						/>
					</div>
				</div>

				{stations.length === 0 ? (
					<p className="text-destructive text-2xl">No Stations found.</p>
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
						<div className="hidden md:block bg-accent p-4 rounded-2xl text-chart-3 shadow-md w-full md:w-3/4 mx-auto mt-8">
							<ReusableTable<Station>
								data={paginatedStations}
								rowKey={(station) => station.id!}
								columns={[
									{
										header: 'Station Name',
										render: (station) => station.stationName,
									},
									{
										header: 'Status',
										className: 'text-center',
										render: (station) => (
											<StatusSwitchOrBadge
												entity={{
													id: station.id!,
													active: station.stationActive,
												}}
												getLabel={() => `Station: ${station.stationName}`}
												onToggle={handleToggleActive}
												canToggle={canToggle}
											/>
										),
									},
									{
										header: 'Actions',
										className: 'text-center',
										render: (station) =>
											sessionUserRole === 'MANAGER' ? (
												<div className="flex justify-center gap-4 items-center">
													<EditStationDialog
														station={station}
														locationId={locationIdParam}
														stations={stations}
														onUpdate={(id, name) =>
															setStations((prev) =>
																prev.map((station) =>
																	station.id === id
																		? { ...station, stationName: name }
																		: station
																)
															)
														}
													/>

													{station.id && (
														<DeleteConfirmButton
															item={{
																id: station.id,
																locationId: locationIdParam,
															}}
															entityLabel="Location"
															onDelete={async (id) => {
																await deleteStation(locationIdParam, id);
																setStations((prev) =>
																	prev.filter((station) => station.id !== id)
																);
															}}
															getItemName={() => station.stationName}
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

export default LocationStationsPage;
