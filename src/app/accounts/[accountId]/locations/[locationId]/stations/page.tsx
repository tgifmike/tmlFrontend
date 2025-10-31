'use client';

import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess } from '@/app/api/locationApi';
import { deleteStation, getStationsByLocation, toggleStationActive } from '@/app/api/stationApi';
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
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { Pagination } from '@/components/tableComponents/Pagination';
import { EditStationDialog } from '@/components/tableComponents/EditStationDialog';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Ghost, Menu, X } from 'lucide-react';
import { DataCard } from '@/components/cards/DataCard';


const LocationStationsPage = () => {

	//session
	const { data: session, status } = useSession();
	const router = useRouter();
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;

	//set state
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
	const [drawerOpen, setDrawerOpen] = useState(false);

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
		<main className="flex min-h-screen overflow-hidden">
			{/* Desktop Sidebar */}
			<aside className="hidden md:block w-1/6 border-r h-screen bg-ring">
				<LocationNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountIdParam}
					locationId={locationIdParam}
					sessionUserRole={sessionUserRole}
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
									aria-label="Open Menu"
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
									<LocationNav
										accountName={accountName}
										accountImage={accountImage}
										accountId={accountIdParam}
										locationId={locationIdParam}
										sessionUserRole={sessionUserRole}
									/>
								</div>
							</DrawerContent>
						</Drawer>

						<h1 className="text-2xl font-semibold">
							{currentLocation?.locationName}
						</h1>
					</div>

					{/* center */}
					<div>
						<p className=" md:text-2xl">Station List:</p>
					</div>

					{/* Right */}
					<div>
						<CreateStationDialog
							onStationCreated={handleStationCreated}
							locationId={locationIdParam}
						/>
					</div>
				</header>

				{/* content */}
				{stations.length === 0 ? (
					<p className="text-destructive text-2xl">No Stations found.</p>
				) : (
					<div>
						{/* Controls */}
						<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
							<UserControls
								showActiveOnly={showActiveOnly}
								setShowActiveOnly={setShowActiveOnly}
								searchTerm={searchTerm}
								setSearchTerm={setSearchTerm}
							/>
						</div>

						{/* Desktop Table */}
						<div className="hidden md:block bg-accent p-4 rounded-2xl text-chart-3 shadow-md w-full md:w-3/4 mx-auto mt-8">
							<ReusableTable<Station>
								data={paginatedStations}
								rowKey={(station) => station.id!}
								columns={[
									{
										header: 'Station Name',
										render: (station) => (
											<Link
												href={`/accounts/${accountIdParam}/locations/${locationIdParam}/stations/${station.id}`}
											>
												{station.stationName}
											</Link>
										),
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

						{/* Mobile Cards */}
						<div className="md:hidden mt-6 space-y-2 p-2">
							{paginatedStations.map((station) => (
								<DataCard
									key={station.id}
									title={station.stationName}
									fields={[
										{
											label: 'Status',
											value: (
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
									]}
									actions={[
										{
											element: (
												<div className="flex justify-center gap-4 items-center">
													{sessionUserRole === 'MANAGER' ? (
														<>
															<EditStationDialog
																station={station}
																locationId={locationIdParam}
																stations={stations}
																onUpdate={(id, name) =>
																	setStations((prev) =>
																		prev.map((s) =>
																			s.id === id
																				? { ...s, stationName: name }
																				: s
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
																			prev.filter((s) => s.id !== id)
																		);
																	}}
																	getItemName={() => station.stationName}
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
			</section>
		</main>
	);
};

export default LocationStationsPage;
