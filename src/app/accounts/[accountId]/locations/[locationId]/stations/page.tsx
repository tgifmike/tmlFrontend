'use client';

import {
	DragDropContext,
	Droppable,
	Draggable,
	DropResult,
} from '@hello-pangea/dnd';
import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess } from '@/app/api/locationApi';
import { deleteStation, getStationsByLocation, reorderStations, toggleStationActive } from '@/app/api/stationApi';
import { AppRole, Locations, StationDto, User } from '@/app/types';
import LocationNav from '@/components/navBar/LocationNav';
import LocationPageHeader from '@/components/navBar/LocationPageHeader';
import Spinner from '@/components/spinner/Spinner';
import CreateStationDialog from '@/components/tableComponents/CreateStationForm';
import { UserControls } from '@/components/tableComponents/UserControls';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { Pagination } from '@/components/tableComponents/Pagination';
import { EditStationDialog } from '@/components/tableComponents/EditStationDialog';
import { DataCard } from '@/components/cards/DataCard';
import { Icons } from '@/lib/icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import StationHistoryFeed from '@/components/tableComponents/StationHistoryFeed';
import { CloneStationDialog } from '@/components/cloneStation/CloneStationDialog';
import { useSession } from '@/lib/auth/session-context';
import { ChevronRight } from 'lucide-react';



interface CreateStationDialogProps {
	locationId: string;
	currentUserId: string;
	onStationCreated: (station: StationDto) => void;
}




const LocationStationsPage = () => {

	//icon
	const UpDownIcon = Icons.sort;
	const StationIcon = Icons.stations;

	//session
	const { user, loading, logout } = useSession();
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

	const currentUser = user as User | undefined;
	const currentUserId = user?.id || '';
	const sessionUserRole = user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;

	useEffect(() => {
		if (
			loading ||
			!user?.id ||
			!accountIdParam ||
			!locationIdParam
		)
			return;
		if (hasAccess) return; // prevent rerun

		const verifyAccess = async () => {
			try {
				// Fetch accounts for user
				const accountsRes = await getAccountsForUser(user.id);
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
				setHasAccess(true);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || account.accountImage || null);
				setCurrentLocation(location);
			} catch (err) {
				toast.error('You do not have access to this location.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [loading, user, accountIdParam, locationIdParam, hasAccess, router]);

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

	return (
		<main className="flex min-h-screen overflow-hidden ">
			{/* Desktop Sidebar */}
			<aside className="hidden w-1/6 shrink-0 self-stretch border-r bg-ring md:block">
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
				<LocationPageHeader
					accountId={accountIdParam}
					locationId={locationIdParam}
					accountName={accountName}
					accountImage={accountImage}
					locationName={currentLocation?.locationName}
					pageName="Stations"
					sessionUserRole={sessionUserRole}
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
				>
					<div>
						<CreateStationDialog
							onStationCreated={handleStationCreated}
							locationId={locationIdParam}
							currentUserId={currentUserId}
						/>
					</div>
				</LocationPageHeader>

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
														className="underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
																						: station,
																				),
																			)
																		}
																	/>
																	{/* ✅ ADD THIS */}
																	{station.id && (
																		<CloneStationDialog
																			stationId={station.id}
																			currentLocationId={locationIdParam}
																			currentAccountId={ accountIdParam}
																			userId={currentUserId}
																			locations={locations}
																			onCloneSuccess={async () => {
																				try {
																					const res =
																						await getStationsByLocation(
																							locationIdParam,
																						);
																					setStations(res.data ?? []);
																				} catch {
																					toast.error(
																						'Failed to refresh stations after clone.',
																					);
																				}
																			}}
																		/>
																	)}
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
						<div className="mt-6 space-y-4 px-3 md:hidden">
							{paginatedStations.map((station) => (
								<DataCard
									key={station.id}
									avatar={
										<span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
											<StationIcon className="size-5" aria-hidden="true" />
										</span>
									}
									title={
										station.id ? (
											<Link
												href={`/accounts/${accountIdParam}/locations/${locationIdParam}/stations/${station.id}`}
												className="group/title flex min-h-11 w-full items-center justify-between gap-3 rounded-sm underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
											>
												<span className="truncate">{station.stationName}</span>
												<ChevronRight
													className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/title:translate-x-0.5 group-hover/title:text-primary"
													aria-hidden="true"
												/>
											</Link>
										) : (
											station.stationName
										)
									}
									description="Open this station to manage its line-check items"
									fields={[
										{
											label: 'Status',
											value: (
												<div className="flex items-center gap-3">
													<StatusSwitchOrBadge
														entity={{
															id: station.id!,
															active: station.stationActive,
														}}
														getLabel={() => `Station: ${station.stationName}`}
														onToggle={handleToggleActive}
														canToggle={canToggle}
													/>
													{canToggle && (
														<span>{station.stationActive ? 'Active' : 'Inactive'}</span>
													)}
												</div>
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
																				: s,
																		),
																	)
																}
															/>

															{/* ✅ CLONE BUTTON */}
															{station.id && (
																<CloneStationDialog
																	stationId={station.id}
																	currentLocationId={locationIdParam}
																	currentAccountId={accountIdParam}
																	userId={currentUserId}
																	locations={locations}
																	onCloneSuccess={async () => {
																		// 🔥 IMPORTANT: refetch stations after clone
																		try {
																			const res =
																				await getStationsByLocation(
																					locationIdParam,
																				);
																			setStations(res.data ?? []);
																		} catch {
																			toast.error(
																				'Failed to refresh stations after clone.',
																			);
																		}
																	}}
																/>
															)}

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

							{paginatedStations.length === 0 && (
								<div className="rounded-2xl border border-dashed bg-muted/10 px-6 py-12 text-center text-sm text-muted-foreground">
									{searchTerm
										? `No stations match “${searchTerm}”.`
										: 'No stations to display.'}
								</div>
							)}
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
						totalItems={filteredStations.length}
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
