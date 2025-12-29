'use client';

import {
	DragDropContext,
	Droppable,
	Draggable,
	DropResult,
} from '@hello-pangea/dnd';
// import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess } from '@/app/api/locationApi';
import { deleteStation, getStationsByLocation, reorderStations, toggleStationActive } from '@/app/api/stationApi';
import { AppRole, Locations, StationDto, User } from '@/app/types';
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
import { DataCard } from '@/components/cards/DataCard';
//import router from 'next/router';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';
import { Icons } from '@/lib/icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import StationHistoryFeed from '@/components/tableComponents/StationHistoryFeed';
// import StationAuditFeed from '@/components/tableComponents/StationHistoryFeed';
// import { a } from 'node_modules/framer-motion/dist/types.d-DagZKalS';
// import { set } from 'zod';

interface CreateStationDialogProps {
	locationId: string;
	currentUserId: string;
	onStationCreated: (station: StationDto) => void;
}




const LocationStationsPage = () => {

	//icon
		const UpDownIcon = Icons.sort;

	//session
	const { data: session, status } = useSession();
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;
	const router = useRouter();

	//set state
	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [stations, setStations] = useState<StationDto[]>([]);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(
		null
	);
	const [showActiveOnly, setShowActiveOnly] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [deletingStationId, setDeletingStationId] = useState<Set<string>>(
		new Set()
	);

	const currentUser = session?.user as User | undefined;
	const currentUserId = session?.user?.id || '';
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
				const locationRes = await getUserLocationAccess(currentUserId);
				const fetchedLocations = locationRes.data ?? [];

				
				setLocations(fetchedLocations);

				const location = fetchedLocations.find(
					(loc) => loc.id?.toString() === locationIdParam
				);

				//console.log('Current location:', location);
				if (!location) {
					
					toast.error('You do not have access to this location.');
					router.push(`/accounts/${accountIdParam}/locations`);
					return;
				}

				//fetch stations
				const stationRes = await getStationsByLocation(locationIdParam);
				const fetchedStations = stationRes.data ?? [];
				setStations(fetchedStations);

				// const stationRes = await getStationsByLocation(locationIdParam);
				// const fetchedStations: StationDto[] = stationRes.data ?? [];

				// // Map DTO → full Station
				// const mappedStations: Station[] = fetchedStations.map((dto) => ({
				// 	id: dto.id,
				// 	stationName: dto.stationName,
				// 	sortOrder: dto.sortOrder ?? 0,
				// 	stationActive: dto.stationActive ?? true, // default true
				// 	locationId: locationIdParam, // attach location
				// 	description: '', // optional default
				// }));

				//setStations(mappedStations);

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
			await toggleStationActive(stationId, checked, currentUserId);
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

	const handleStationCreated = (newStation: StationDto) => {
		setStations((prev) => [...prev, newStation]);
	};

	//handle station delete
const hanldeStationDelete = async (stationId: string) => {
	try {
		setDeletingStationId((prev) => {
			const newSet = new Set(prev);
			newSet.add(stationId);
			return newSet;
		});

		await deleteStation(stationId, currentUserId);

		setStations((prev) => prev.filter((station) => station.id !== stationId));

		toast.success('Station deleted successfully.');
	} catch (error: any) {
		toast.error(`Failed to delete station: ` + (error?.message || error));
	} finally {
		setDeletingStationId((prev) => {
			const newSet = new Set(prev);
			newSet.delete(stationId);
			return newSet;
		});
	}
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

	// drag & drop
		const handleDragEnd = async (result: DropResult) => {
			if (!result.destination) return;
			const sourceIndex = result.source.index;
			const destIndex = result.destination.index;
	
			const updatedStations = Array.from(stations);
			const [removed] = updatedStations.splice(sourceIndex, 1);
			updatedStations.splice(destIndex, 0, removed);
	
			setStations(updatedStations);
	
			try {
				const stationIdsInOrder = updatedStations.map((i) => i.id!) as any;
				await reorderStations(locationIdParam, stationIdsInOrder, currentUserId);
			} catch (err) {
				toast.error('Failed to save new station order.');
			}
		};

	if (status === 'loading' || loadingAccess || !currentUserId) {
		return (
			<div className="flex justify-center items-center py-40 text-chart-3 text-xl">
				<Spinner />
				<span className="ml-4">Loading Stations…</span>
			</div>
		);
	}

	return (
		<main className="flex min-h-screen overflow-hidden ">
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
						<MobileDrawerNav
							open={drawerOpen}
							setOpen={setDrawerOpen}
							title="Menu"
						>
							<LocationNav
								accountName={accountName}
								accountImage={accountImage}
								accountId={accountIdParam}
								locationId={locationIdParam}
								sessionUserRole={sessionUserRole}
							/>
						</MobileDrawerNav>

						<h1 className="text-2xl font-semibold">
							{currentLocation?.locationName}
						</h1>
					</div>

					{/* center */}
					<div>
						<p className=" md:text-2xl">
							Stations for Account{' '}
							<span className="text-chart-3 italic"> {accountName}</span>:
						</p>
					</div>

					{/* Right */}
					<div>
						<CreateStationDialog
							onStationCreated={handleStationCreated}
							locationId={locationIdParam}
							currentUserId={currentUserId}
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

						{/* Dragable Desktop Table */}

						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId="items">
								{(provided) => (
									<div
										className="hidden md:block bg- p-4 rounded-2xl shadow-md w-full md:w-3/4 mx-auto mt-8 bg-ring/40"
										{...provided.droppableProps}
										ref={provided.innerRef}
									>
										{/* Table headers */}
										<div className="flex justify-between items-center font-bold text-lg px-2 py-1 border-b border-accent mb-2 ">
											<span className="flex items-center gap-2 w-1/2">
												<UpDownIcon className="w-5 h-5" />
												Station Name
											</span>
											<span className="w-1/4 text-center">Status</span>
											<span className="w-1/4 text-center">Actions</span>
										</div>

										{/* Draggable rows */}
										{paginatedStations.map((station, index) => (
											<Draggable
												key={station.id}
												draggableId={station.id!}
												index={index}
											>
												{(provided) => (
													<div
														className="flex justify-between items-center p-2 mb-2 bg-accent rounded-2xl text-chart-3"
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
													>
														{/* Icon + Name */}
														<div className="flex items-center gap-2 w-1/2">
															<Tooltip>
																<TooltipTrigger>
																	<UpDownIcon className="w-5 h-5" />
																</TooltipTrigger>
																<TooltipContent>
																	<p>Drag and Drop items to sort them.</p>
																</TooltipContent>
															</Tooltip>
															<Link
																href={`/accounts/${accountIdParam}/locations/${locationIdParam}/stations/${station.id}`}
															>
																{station.stationName}
															</Link>
															{/* <span>{station.stationName}</span> */}
														</div>

														{/* Status */}
														<div className="w-1/4 text-center">
															<StatusSwitchOrBadge
																entity={{
																	id: station.id!,
																	active: station.stationActive,
																}}
																getLabel={() => `item: ${station.stationName}`}
																onToggle={handleToggleActive}
																canToggle={canToggle}
															/>
														</div>

														{/* Actions */}
														<div className="w-1/4 flex justify-center items-center gap-2">
															{sessionUserRole === AppRole.MANAGER && (
																<>
																	<EditStationDialog
																		currentUserId={currentUserId}
																		station={station}
																		// locationId={locationIdParam}
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
																			}}
																			entityLabel="Station"
																			onDelete={hanldeStationDelete}
																			getItemName={() => station.stationName}
																		/>
																	)}{' '}
																</>
															)}
														</div>
													</div>
												)}
											</Draggable>
										))}

										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</DragDropContext>

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
																currentUserId={currentUserId}
																station={station}
																// locationId={locationIdParam}
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
																	}}
																	entityLabel="Station"
																	onDelete={hanldeStationDelete}
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

				<div>
					<StationHistoryFeed
						locationId={locationIdParam}
						currentUser={currentUser}
					/>
				</div>
			</section>
		</main>
	);
};

export default LocationStationsPage;
